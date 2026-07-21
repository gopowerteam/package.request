# @gopowerteam/request-generate

[![npm version](https://img.shields.io/npm/v/@gopowerteam/request-generate.svg)](https://www.npmjs.com/package/@gopowerteam/request-generate)
[![npm downloads](https://img.shields.io/npm/dm/@gopowerteam/request-generate.svg)](https://www.npmjs.com/package/@gopowerteam/request-generate)
[![types](https://img.shields.io/npm/types/@gopowerteam/request-generate.svg)](https://www.npmjs.com/package/@gopowerteam/request-generate)

基于 OpenAPI / Swagger 规范自动生成类型安全 Service 代码的工具链。支持 **OpenAPI v2 与 v3**,提供 **CLI**、**编程式 API** 与 **Vite 插件** 三种接入方式,生成的代码直接消费 [`@gopowerteam/request`](https://www.npmjs.com/package/@gopowerteam/request) 的 `RequestService`。

## 特性

- **双版本规范** —— 同时解析 OpenAPI / Swagger 2.0 与 3.0 文档
- **三种接入方式** —— CLI(开箱即用)、编程式 API(集成到脚本)、Vite 插件(开发时自动生成)
- **类型安全产物** —— 生成完整的 Service 类与 Model 类型定义,IDE 自动补全全程在线
- **灵活命名** —— 通过 `serviceResolve` / `operationResolve` 自定义服务类名与方法名,支持中文 tag 处理与 `operationId` 清洗
- **Promise / Observable 双模式** —— `responseType: 'promise'` 返回 Promise,`'observable'` 返回 rxjs Observable
- **查询参数治理** —— `excludeQueryParams` 一键剔除分页等通用参数,避免重复样板
- **多应用聚合** —— 单份配置驱动多个后端服务的代码生成
- **智能 Content-Type** —— 自动识别 `multipart` / `binary` / `urlencoded` / `text` 等 media 类型并注入对应请求头
- **虚拟模块** —— Vite 插件把所有 Service 聚合成 `virtual:request`,统一导入入口

## 工作原理

```
OpenAPI 文档(JSON/URL)
        │
        ▼
┌──────────────────────┐    解析(parseV2 / parseV3)
│  request-generate    │ ─────────────────────────►
│  (CLI / API / Vite)  │    模板渲染(Handlebars)
└──────────────────────┘
        │
        ▼
   生成产物(*.ts)
   ├── services/*Service.ts  ── 运行时依赖 ──►  @gopowerteam/request
   └── models/*.ts                                    │
                                                      ▼
                                              RequestService.send()
```

生成的 Service 类会从 `@gopowerteam/request` 导入 `RequestService` 并调用其 `send()` / `toURL()`,因此**运行时必须安装 `@gopowerteam/request`**。

## 安装

```bash
# pnpm
pnpm add @gopowerteam/request-generate @gopowerteam/request

# npm
npm install @gopowerteam/request-generate @gopowerteam/request

# yarn
yarn add @gopowerteam/request-generate @gopowerteam/request
```

> `@gopowerteam/request` 是生成代码的运行时依赖,必须一同安装。若使用 Observable 模式,还需自行安装 `rxjs`。

## 快速开始

### 1. 编写配置文件

在项目根目录新建 `request.config.ts`。CommonJS 与 ESM 两种写法都支持(由 tsx 加载);下方用 CommonJS 演示最简写法,完整字段与注释见 [完整配置示例](#完整配置示例)。

```ts
/**
 * @type {import('@gopowerteam/request-generate').GenerateOptions}
 */
module.exports = {
  gateway: 'https://api.example.com',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  logger: true,
  appendService: false,
  exportServices: {
    responseType: 'promise',
    excludeQueryParams: ['page', 'size', 'order'],
  },
}
```

### 2. 运行 CLI 生成代码

```bash
# 默认读取根目录的 request.config.ts
request-generate

# 指定配置文件
request-generate --config ./config/request.config.ts
```

### 3. 产物结构

```
src/generated/http/
├── services/
│   ├── UserService.ts       # Service 类,每个 operation 一个方法
│   └── OrderService.ts
└── models/
    ├── User.ts              # 接口对应的类型定义
    └── Order.ts
```

### 4. 在业务代码中使用

先完成 [`@gopowerteam/request`](https://www.npmjs.com/package/@gopowerteam/request) 的全局 `setup()`,然后:

```ts
import { UserService } from '@/generated/http/services/UserService'

const userService = new UserService()

// 发起请求(返回 Promise)
const user = await userService.getUser({
  userId: 42,
})

// 或仅生成 URL(常用于下载 / 外链)
const url = userService.exportUser(
  { userId: 42 },
  [],
  { type: RequestGenerateType.URL },
)
```

## 配置详解

`GenerateOptions` 全字段:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gateway` | `string` | 是 | API 网关地址,作为生成 Service 的 `service` 上下文 |
| `openapi` | `string` | 是 | OpenAPI 文档路径(拼在 `gateway` / 应用地址之后,如 `/v3/api-docs`) |
| `output` | `string` | 是 | 产物输出目录(相对路径) |
| `exportModels` | `boolean` | 是 | 是否生成 Model 类型文件 |
| `logger` | `boolean` | 否 | 是否在控制台输出生成进度日志 |
| `appendService` | `boolean` | 否 | 是否在请求路径前追加 service 前缀 |
| `applications` | `Record<string, ApplicationConfig>` | 否 | 多应用配置,见下节 |
| `exportServices` | `object` | 否 | 服务生成细项,见下表 |

`exportServices` 子项:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `serviceResolve` | `(ctx) => string \| string[]` | 按 path / method / operation object / tags 自定义 Service 类名 |
| `operationResolve` | `(ctx) => string` | 按 operation 自定义方法名(默认用 `operationId`) |
| `excludeQueryParams` | `string[]` | 需要从查询参数中剔除的字段(如分页字段) |
| `responseType` | `'promise' \| 'observable'` | 返回类型,`observable` 会用 `rxjs.from` 包裹 |

## 多应用配置

一份配置驱动多个后端服务。`applications` 是一个 map,key 是服务别名(会作为生成 Service 的 `service` 字段),value 支持两种形态:

```ts
module.exports = {
  gateway: 'https://gateway.local.example.com',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  applications: {
    // 形态一:字符串,表示实际的应用 key,复用顶层 openapi 路径
    'mall-service': 'xbt-platform-mall-service',

    // 形态二:对象,可单独指定 openapi 路径
    'file-service': {
      key: 'xbt-platform-file-service',
      openapi: '/v2/api-docs',
    },
  },
}
```

上例会分别从 `{gateway}/xbt-platform-mall-service/v3/api-docs` 与 `{gateway}/xbt-platform-file-service/v2/api-docs` 拉取文档并生成对应 Service。

## 自定义命名

默认情况下,Service 类名取自 OpenAPI 的 tag,方法名取自 `operationId`。当后端命名不规范时,可用 `serviceResolve` 与 `operationResolve` 清洗。

### 处理中文 tag 与英文 tag

```ts
module.exports = {
  // ...其余配置
  exportServices: {
    serviceResolve({ object, tags }) {
      const tagName = object.tags?.[0]
      if (!tagName)
        return 'default'

      // 中文 tag:从 tag.description 还原英文类名
      if (/[\u4E00-\u9FA5]+/.test(tagName)) {
        const tag = tags.find(t => t.name === tagName)
        return tag?.description
          ? tag.description.replace(/\s/g, '').replace(/Controller$/g, '')
          : 'default'
      }

      // 英文 tag:直接使用
      return tagName
    },

    // 清洗 operationId 中的后缀(如 getUser_1、createUserUsingPOST_2)
    operationResolve({ object }) {
      return object.operationId!
        .replace(/_\d+$/g, '')
        .replace(/Using(GET|POST|PUT|PATCH|DELETE)_*\d*$/g, '')
    },
  },
}
```

## 完整配置示例

下面是一份带注释的完整 `request.config.ts` 示例,集中演示所有配置项的用法,可直接复制后按需删改。

> **写法说明**:配置文件由 tsx 加载,**CommonJS**(`module.exports = {...}`)与 **ESM**(`export default defineConfig({...})`)两种写法都支持。ESM 项目(或 `"type": "module"`)推荐用下方 `defineConfig` 写法 —— 可获得完整的类型提示与字段校验。

```ts
import { defineConfig } from '@gopowerteam/request-generate'

/**
 * request-generate 配置文件
 *
 * CLI 会按以下顺序自动查找(无需 --config):
 *   request.config.ts → request-generate.config.{cjs,mjs,js}
 */
export default defineConfig({
  // 网关地址,作为各应用 OpenAPI 文档的拉取前缀
  gateway: 'https://api.example.com',

  // 默认 OpenAPI 文档路径(applications 中未单独指定时使用)
  openapi: '/v3/api-docs',

  // 生成代码的输出目录(相对当前目录)
  output: './src/http',

  // 是否生成 Model 类型文件
  exportModels: true,

  /**
   * 多应用配置
   * key   服务别名(会作为生成 Service 类的 service 字段)
   * value 字符串 = 复用顶层 openapi;对象 = 单独指定 key 与 openapi
   */
  applications: {
    'user-service': {
      key: 'user-service',
      openapi: '/v3/api-docs',
    },
    'order-service': {
      key: 'order-service',
      openapi: '/v2/api-docs',
    },
    'product-service': {
      key: 'product-service',
      openapi: '/v3/api-docs',
    },
  },

  // 是否输出进度日志
  logger: true,

  exportServices: {
    /**
     * 自定义解析器 —— Service 类名解析(可省略,默认用 OpenAPI tag)
     *
     * 按自己业务实现,返回 string | string[]。
     * 入参 { path, method, object, tags }:
     *   object 当前 operation(含 tags / operationId / summary)
     *   tags   文档顶层 Tag 定义(含 name / description)
     *
     * 示例:中文 tag 取 description 还原英文类名,英文 tag 直接使用
     */
    serviceResolve({ object, tags }) {
      const tagName = object.tags?.[0]

      if (!tagName) {
        return 'default'
      }

      if (/[\u4E00-\u9FA5]+/.test(tagName)) {
        const tag = tags.find(tag => tag.name === tagName)
        return tag && tag.description ? tag.description.replace(/\s/g, '').replace(/Controller$/g, '') : 'default'
      }
      else {
        return tagName
      }
    },

    /**
     * 自定义解析器 —— 方法名(operation)解析(可省略,默认用 operationId)
     *
     * 按自己业务实现,返回 string。
     * 入参 { path, method, object }
     *
     * 示例:清洗 operationId 的数字后缀与 Using(GET|POST|...) 后缀
     */
    operationResolve({ object }) {
      return object.operationId!
        .replace(/_*\d*$/g, '')
        .replace(/Using(GET|POST|PUT|PATCH|DELETE)_*\d*$/g, '')
    },

    // 响应模式:'promise' 返回 Promise;'observable' 返回 rxjs Observable
    responseType: 'promise',

    // 全局剔除的查询参数(如后端统一的分页字段),不会出现在生成方法的查询参数类型中
    excludeQueryParams: [
      'pageNumber',
      'pageSize',
      'page',
      'size',
      'paged',
      'unpaged',
      'order',
      'sort',
      'offset',
    ],
  },
})
```

## 查询参数与响应模式

### 剔除通用查询参数

后端常统一携带 `page` / `size` / `order` 等分页字段,若不希望它们出现在每个方法的查询参数类型中:

```ts
module.exports = {
  // ...其余配置
  exportServices: {
    excludeQueryParams: ['pageNumber', 'pageSize', 'page', 'size', 'order', 'sort'],
  },
}
```

### Observable 响应模式

```ts
module.exports = {
  // ...其余配置
  exportServices: {
    responseType: 'observable',
  },
}
```

切换后,生成的 Service 方法会返回 `Observable<T>`(内部用 `rxjs.from` 包裹 `RequestService.send()` 的 Promise),适合在 Angular / RxJS 项目中配合管道操作符使用。

## 编程式调用

无需 CLI,直接在脚本里调用:

```ts
import type { GenerateOptions } from '@gopowerteam/request-generate'
import { defineConfig, download, generate } from '@gopowerteam/request-generate'

const options: GenerateOptions = defineConfig({
  gateway: 'https://api.example.com',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  applications: {
    'user-service': 'user-service',
  },
  exportServices: {
    responseType: 'promise',
  },
})

async function main() {
  // 先下载 OpenAPI 文档到 .request/ 目录(可选,便于离线 / 调试)
  await download(options)

  // 再根据配置生成代码
  await generate(options)
}

main()
```

| 函数 | 说明 |
| --- | --- |
| `generate(options)` | 解析 OpenAPI 文档并生成 Service / Model 代码 |
| `download(options)` | 把各应用的 OpenAPI 文档下载到 `.request/{name}.json` |
| `defineConfig(options)` | 配置对象的类型守卫 helper,返回原对象(便于 IDE 提示) |

## Vite 插件

Vite 插件在 `buildStart` 阶段自动触发 CLI 生成代码,并把所有 `*Service.ts` 聚合成虚拟模块 `virtual:request`,提供统一导入入口。

### 接入

```ts
// vite.config.ts
import { fileURLToPath } from 'node:url'
import request from '@gopowerteam/request-generate/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    request({
      alias: '@',                              // 对应 resolve.alias 的别名
      dir: 'src/http',                          // Service 文件所在目录
      dts: 'src/types/generated/request.d.ts',  // 声明文件输出位置;false 关闭
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
})
```

### 插件选项

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `alias` | `string` | 必须与 `resolve.alias` 中配置的别名一致,用于解析 Service 文件路径 |
| `dir` | `string` | Service 文件所在目录(相对项目根) |
| `dts` | `string \| boolean` | 声明文件输出路径;传 `false` 不生成 |

### 使用虚拟模块

插件聚合后,可在业务代码里通过虚拟模块一次性导入所有 Service:

```ts
import { UserService, OrderService } from 'virtual:request'

const userService = new UserService()
```

> 插件依赖项目根目录下存在有效的 `request.config.ts`,且 `node_modules/.bin/request-generate` 可执行(安装本包即自动可用)。

## CLI 参考

本包注册两个命令:

```bash
# 生成 Service / Model 代码
request-generate [--config <path>]

# 下载 OpenAPI 文档到 .request/ 目录
request-download [--config <path>]
```

| 参数 | 说明 |
| --- | --- |
| `--config <path>` | 指定配置文件路径,缺省时按下方顺序查找 |

### 配置文件查找顺序

未传 `--config` 时,按以下顺序在当前工作目录查找:

1. `request.config.ts`(推荐,通过 tsx 加载,可用 `module.exports`)
2. `request-generate.config.cjs`
3. `request-generate.config.mjs`
4. `request-generate.config.js`

> 任意一个候选文件存在即停止查找;全部不存在时抛错。仅支持上述四种扩展名。

## API 导出

### 主入口 `@gopowerteam/request-generate`

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `generate` | `(options: GenerateOptions) => Promise<void>` | 生成代码 |
| `download` | `(options: GenerateOptions) => Promise<void>` | 下载 OpenAPI 文档 |
| `defineConfig` | `(config: GenerateOptions) => GenerateOptions` | 配置类型守卫 |
| `GenerateOptions` | 接口 | 生成配置(含 `ApplicationConfig` / `GenerateApplicationOptions` 子类型) |

### Vite 插件入口 `@gopowerteam/request-generate/vite-plugin`

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `default` | `(options: PluginOptions) => PluginOption` | Vite 插件工厂函数 |

### CLI

| 命令 | 入口 | 说明 |
| --- | --- | --- |
| `request-generate` | `bin/generate.mts` | 生成 Service / Model |
| `request-download` | `bin/download.mts` | 下载 OpenAPI 文档 |

## 相关生态

- [`@gopowerteam/request`](https://www.npmjs.com/package/@gopowerteam/request) —— 适配器模式的 HTTP 请求库,本包生成代码的运行时依赖

## License

MIT (c) [gopowerteam](https://github.com/gopowerteam)

仓库地址:[github.com/gopowerteam/package.request](https://github.com/gopowerteam/package.request)(本包位于 `packages/request-generate`)
