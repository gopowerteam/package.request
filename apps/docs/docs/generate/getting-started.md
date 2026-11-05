# 代码生成快速上手

`@gopowerteam/request-generate` 从 OpenAPI / Swagger 文档生成类型安全的 Service 与 Model 代码,运行时直接消费 [`@gopowerteam/request`](/guide/introduction.md)。支持 **OpenAPI v2 / v3 / v3.1**。

## 安装

```bash
pnpm add @gopowerteam/request-generate @gopowerteam/request
```

> `@gopowerteam/request` 是生成代码的**运行时依赖**,必须一同安装;`rxjs`(>=7)仅 Observable 模式需要。

## 1. 编写配置文件

项目根目录新建 `request.config.ts`(tsx 加载,CommonJS / ESM 均可;ESM 推荐 `defineConfig` 获得完整类型提示):

```ts
import { defineConfig } from '@gopowerteam/request-generate'

export default defineConfig({
  // 网关地址,作为各应用 OpenAPI 文档的拉取前缀
  gateway: 'https://api.example.com',
  // 默认 OpenAPI 文档路径(applications 未单独指定时使用)
  openapi: '/v3/api-docs',
  // 产物输出目录(相对当前目录)
  output: './src/generated/http',
  // 是否生成 Model 类型文件
  exportModels: true,
  // 输出进度日志
  logger: true,
  exportServices: {
    responseType: 'promise',
    // 剔除后端统一的分页查询参数,不出现在方法参数类型中
    excludeQueryParams: ['page', 'size', 'order'],
  },
})
```

### 核心配置速查

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gateway` | `string` | 是 | API 网关地址 |
| `openapi` | `string` | 是 | OpenAPI 文档路径(拼在 gateway / 应用地址后) |
| `output` | `string` | 是 | 产物输出目录 |
| `exportModels` | `boolean` | 是 | 是否生成 Model 类型文件 |
| `logger` | `boolean` | 否 | 输出生成进度日志 |
| `appendService` | `boolean` | 否 | 请求路径前追加 service 前缀 |
| `applications` | `Record<string, ...>` | 否 | 多应用配置 |
| `exportServices` | `object` | 否 | 服务生成细项(见下) |

`exportServices` 子项:

| 字段 | 说明 |
| --- | --- |
| `serviceResolve(ctx)` | 自定义 Service 类名(默认取 OpenAPI tag),支持中文 tag 还原 |
| `operationResolve(ctx)` | 自定义方法名(默认取 `operationId`),可清洗后缀 |
| `excludeQueryParams: string[]` | 全局剔除的查询参数 |
| `responseType: 'promise' \| 'observable'` | 响应模式,observable 用 rxjs.from 包装 |

## 2. 运行生成

```bash
# 默认读取根目录的 request.config.ts
request-generate

# 指定配置文件
request-generate --config ./config/request.config.ts
```

产物结构:

```
src/generated/http/
├── services/
│   ├── UserService.ts       # Service 类,每个 operation 一个方法
│   └── OrderService.ts
└── models/
    ├── User.ts              # 类型定义
    └── Order.ts
```

## 3. 在业务代码中使用

先完成 [`@gopowerteam/request` 的全局 setup](/guide/getting-started.md),然后:

```ts
import { UserService } from '@/generated/http/services/UserService'

const userService = new UserService()

// 发起请求:方法自动携带响应类型,无需手动标注泛型
const user = await userService.getUser({ userId: 42 })
```

## 多应用聚合

一份配置驱动多个后端服务。`applications` 的 key 是服务别名(作为生成 Service 的 `service` 字段),value 支持两种形态:

```ts
applications: {
  // 形态一:字符串 = 应用 key,复用顶层 openapi 路径
  'mall-service': 'xbt-platform-mall-service',

  // 形态二:对象,可单独指定 openapi 路径(可混用 v2 / v3 文档)
  'file-service': {
    key: 'xbt-platform-file-service',
    openapi: '/v2/api-docs',
  },
}
```

## 自定义命名

后端命名不规范时用 `serviceResolve` / `operationResolve` 清洗(完整示例见包 README):

```ts
exportServices: {
  // 中文 tag:从 tag.description 还原英文类名;英文 tag 直接使用
  serviceResolve({ object, tags }) {
    const tagName = object.tags?.[0]
    if (!tagName) return 'default'
    if (/[\u4E00-\u9FA5]+/.test(tagName)) {
      const tag = tags.find(t => t.name === tagName)
      return tag?.description
        ? tag.description.replace(/\s/g, '').replace(/Controller$/g, '')
        : 'default'
    }
    return tagName
  },

  // 清洗 operationId 后缀(getUser_1、createUserUsingPOST_2)
  operationResolve({ object }) {
    return object.operationId!
      .replace(/_\d+$/g, '')
      .replace(/Using(GET|POST|PUT|PATCH|DELETE)_*\d*$/g, '')
  },
}
```

## 增量缓存

通过账本 `.request/.config.json` 实现增量生成,每个应用记录两维指纹,任一变化即重新生成:

| 指纹 | 感知的变化 |
| --- | --- |
| `md5` | 后端接口变更(文档快照内容 MD5)|
| `configMd5` | 生成规则变更(responseType / excludeQueryParams / 命名函数 / appendService / exportModels / 应用配置 / 本包版本号)|

均未变化且输出目录存在时跳过生成。账本"先生成、后提交",中途失败保持旧账本;损坏时自动视为空(全量重生成)。monorepo 本地开发改了模板 / 生成逻辑时,删除 `.request/.config.json` 即可强制全量重生成。

## 下一步

- [CLI 与 Vite 插件](/generate/cli-vite.md)
- [OpenAPI 3.1 支持说明](/generate/openapi-31.md)
- [业务消费示例](/examples/basic-crud.md)
