# 快速上手

## 安装

```bash
# pnpm
pnpm add @gopowerteam/request

# npm
npm install @gopowerteam/request
```

`axios` 与 `qs` 为运行时依赖,自动安装。

## 全局配置

`setup(config)` 向 `RequestService` 注入全局配置,**整个应用只需调用一次**(建议在入口文件执行):

```ts
import { setup } from '@gopowerteam/request'
import { AxiosAdapter } from '@gopowerteam/request/adapters'

setup({
  gateway: 'https://api.example.com',
  adapter: new AxiosAdapter(),
  timeout: 10000,
  interceptors: {
    // 判定业务是否成功:决定走 success 还是 error
    status: { exec: res => res.status >= 200 && res.status < 300 },
    // 成功分支:exec 返回值即 send() 的 resolved 值
    success: { exec: res => res.data },
    // 失败分支:exec 返回值即 send() 的 rejected 值
    error: { exec: res => res.data },
    // 网络 / 适配器层异常:兜底日志或上报
    exception: { exec: res => console.error('请求异常', res) },
  },
  plugins: [],
})
```

### 配置字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gateway` | `string` | 是 | API 网关地址,作为请求的 `baseURL` |
| `adapter` | `RequestAdapter` | 否 | 底层 HTTP 客户端适配器,不传时调用 `send` 会抛错 |
| `timeout` | `number` | 否 | 请求超时时间(毫秒) |
| `qs` | `IStringifyOptions` | 否 | `qs` 序列化选项,覆盖默认的数组 / 空值行为 |
| `interceptors` | 见下 | 是 | 四类响应拦截器,**缺一不可** |
| `plugins` | `RequestPlugin[]` | 否 | 全局插件,对所有请求生效 |

## 发起第一个请求

```ts
import { RequestMethod, RequestService } from '@gopowerteam/request'

const request = RequestService.getInstance()

const data = await request.send({
  path: '/users',
  method: RequestMethod.Get,
  paramsQuery: { page: 1, size: 20 },
})
```

`send` 支持响应类型泛型,显式声明可获得完整类型链路:

```ts
interface UserInfo {
  id: number
  name: string
}

const user = await request.send<UserInfo>({
  path: '/users/{id}',
  method: RequestMethod.Get,
  paramsPath: { id: 42 },
})
```

> `T` 是**信任断言**:运行时数据经你的拦截器(`success.exec`)转换产出,类型系统无法验证其与 `T` 一致,需自行保证拦截器产出与声明匹配。通过 [`request-generate`](/generate/getting-started.md) 生成的 Service 方法已自动携带类型,无需手动标注。

## 下一步

- [`send` 全部选项与 `toURL`](/guide/request.md)
- [插件系统与请求取消](/guide/plugins.md)
- [跳过手写,直接从 OpenAPI 生成 Service](/generate/getting-started.md)
