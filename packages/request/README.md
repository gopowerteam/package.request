# @gopowerteam/request

[![npm version](https://img.shields.io/npm/v/@gopowerteam/request.svg)](https://www.npmjs.com/package/@gopowerteam/request)
[![npm downloads](https://img.shields.io/npm/dm/@gopowerteam/request.svg)](https://www.npmjs.com/package/@gopowerteam/request)
[![types](https://img.shields.io/npm/types/@gopowerteam/request.svg)](https://www.npmjs.com/package/@gopowerteam/request)

基于**适配器模式**的 HTTP 请求库。通过可插拔的适配器对接底层 HTTP 客户端(内置 axios),配合插件中间件与响应拦截器,提供类型安全、可扩展、跨运行时(Node / 浏览器)的统一请求方案。

## 特性

- **适配器模式** —— `RequestAdapter` 接口解耦请求调度与底层 HTTP 客户端,内置 `AxiosAdapter` 可直接使用,也可自行实现对接 fetch / 小程序等运行时
- **插件中间件** —— 通过 `before` / `after` / `catch` 三段生命周期织入鉴权、loading、日志、埋点等横切逻辑
- **响应拦截器** —— 用 `status` / `success` / `error` / `exception` 四类拦截器集中管理"成功判定 / 数据转换 / 错误处理 / 异常兜底"
- **单例服务** —— `RequestService.getInstance()` 提供全局唯一请求入口,配置一次,到处可用
- **路径参数与查询参数** —— 内置 `{id}` 模板替换与 `qs` 序列化(数组、嵌套、空值过滤)
- **智能 Content-Type** —— `AxiosAdapter` 按运行时 body 自动推断(FormData / Blob / URLSearchParams 等),显式设置绝对优先
- **双模块格式** —— 同时产出 ESM + CJS + `.d.ts`,Node 与打包工具无缝消费
- **全量 TypeScript** —— 所有接口与选项均带类型,`strict` 模式友好的

## 安装

```bash
# pnpm
pnpm add @gopowerteam/request

# npm
npm install @gopowerteam/request

# yarn
yarn add @gopowerteam/request
```

`axios` 与 `qs` 为运行时依赖,会自动安装。

## 快速上手

```ts
import { setup, RequestService, RequestMethod } from '@gopowerteam/request'
import { AxiosAdapter } from '@gopowerteam/request/adapters'

// 1. 安装全局配置
setup({
  gateway: 'https://api.example.com',
  adapter: new AxiosAdapter(),
  timeout: 10000,
  interceptors: {
    status: { exec: res => res.status >= 200 && res.status < 300 },
    success: { exec: res => res.data },
    error: { exec: res => res.data },
    exception: { exec: res => console.error('请求异常', res) },
  },
  plugins: [],
})

// 2. 发起请求
async function bootstrap() {
  const request = RequestService.getInstance()

  const data = await request.send({
    path: '/users',
    method: RequestMethod.Get,
    paramsQuery: { page: 1, size: 20 },
  })

  console.log(data)
}

bootstrap()
```

## 全局配置

`setup(config: RequestSetupConfig)` 向 `RequestService` 注入全局配置,整个应用只需调用一次。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gateway` | `string` | 是 | API 网关地址,会作为请求的 `baseURL` |
| `adapter` | `RequestAdapter` | 否 | 底层 HTTP 客户端适配器,不传时调用 `send` 会抛错 |
| `timeout` | `number` | 否 | 请求超时时间(毫秒),透传给适配器 |
| `qs` | `IStringifyOptions` | 否 | `qs` 序列化选项,覆盖默认的数组 / 空值行为 |
| `interceptors` | 见下表 | 是 | 四类响应拦截器,缺一不可 |
| `plugins` | `RequestPlugin[]` | 否 | 全局插件,对所有请求生效 |

`interceptors` 字段:

| 拦截器 | 触发时机 | 返回值作用 |
| --- | --- | --- |
| `status` | 每次响应后 | 返回布尔值,决定走 `success` 还是 `error` |
| `success` | `status` 返回 `true` | `exec` 的返回值作为 `send` 的 resolved 值 |
| `error` | `status` 返回 `false` | `exec` 的返回值作为 `send` 的 rejected 值 |
| `exception` | 网络层 / 适配器层抛错 | 用于兜底日志或上报,不参与 `send` 的返回 |

## 发起请求

通过 `RequestService.getInstance().send(options, plugins?)` 发起请求。

### `RequestSendOptions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `path` | `string` | 请求路径,支持 `{id}` 形式的路径参数 |
| `method` | `RequestMethod \| string` | HTTP 方法,推荐用 `RequestMethod` 枚举 |
| `service` | `string` | 服务前缀,会拼接为 `/{service}/{path}` |
| `headers` | `Record<string, string \| boolean>` | 请求头,`false` 表示删除该头(axios 语义) |
| `paramsPath` | `Record<string, string \| number>` | 路径参数,替换 `path` 中的 `{key}` |
| `paramsQuery` | `Record<string, any>` | 查询参数,经 `qs` 序列化 |
| `paramsBody` | `any` | 请求体 |

### GET 查询参数

```ts
await request.send({
  path: '/users',
  method: RequestMethod.Get,
  paramsQuery: { keyword: 'foo', roles: ['admin', 'user'] },
})
// GET /users?keyword=foo&roles=admin&roles=user
```

### POST 请求体

```ts
await request.send({
  path: '/users',
  method: RequestMethod.Post,
  paramsBody: { name: 'Alice', age: 28 },
})
```

### 路径参数

```ts
await request.send({
  path: '/users/{id}/posts/{postId}',
  method: RequestMethod.Get,
  paramsPath: { id: 42, postId: 'abc' },
})
// GET /users/42/posts/abc
```

### 服务前缀

```ts
await request.send({
  service: 'user-service',
  path: '/users',
  method: RequestMethod.Get,
})
// GET {gateway}/user-service/users
```

## 生成 URL

`toURL(options, plugins?)` 不发起请求,仅按配置生成完整 URL,常用于下载、外链跳转。

```ts
const url = request.toURL({
  path: '/export',
  method: RequestMethod.Get,
  paramsQuery: { type: 'csv', ids: [1, 2, 3] },
})
// https://api.example.com/export?type=csv&ids=1&ids=2&ids=3
```

## 插件

实现 `RequestPlugin` 接口即可织入请求生命周期。插件既可作为全局配置,也可按请求传入 `send` / `toURL` 的第二个参数。

### 生命周期

| 钩子 | 触发时机 | 用途 |
| --- | --- | --- |
| `before(options, appendParams)` | 请求发出前 | 改写请求参数、注入 header |
| `after(response, options)` | 响应成功转换后 | 成功分支的副作用 |
| `catch(response, options)` | 响应异常转换后 | 异常分支的副作用 |

`before` 的第二个参数 `appendParams` 可向底层适配器追加额外配置(例如透传 axios 的 `responseType`):

```ts
function withResponseType(): RequestPlugin {
  return {
    before: (_options, appendParams) => {
      appendParams({ responseType: 'blob' })
    },
  }
}

await request.send(
  { path: '/files/1', method: RequestMethod.Get },
  [withResponseType()],
)
```

### 注入鉴权 Token(全局插件示例)

```ts
setup({
  // ...其余配置
  plugins: [
    {
      before: (options) => {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${getToken()}`,
        }
      },
    },
  ],
})
```

### Loading 切换(请求级插件示例)

```ts
class LoadingPlugin implements RequestPlugin {
  before() { showLoading() }
  after() { hideLoading() }
  catch() { hideLoading() }
}

await request.send(
  { path: '/users', method: RequestMethod.Get },
  [new LoadingPlugin()],
)
```

> 全局插件与请求级插件都会执行;`before` 先执行全局、再执行请求级,`after` / `catch` 同理。

## 响应拦截器

实现 `ResponseInterceptor` 接口即可。下面是一套常见用法:

```ts
import type { AdapterResponse } from '@gopowerteam/request'

// 判定业务是否成功(决定走 success 还是 error)
class StatusInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return res.status >= 200 && res.status < 300
      && res.data?.code === 0
  }
}

// 成功:剥离外层信封,只返回业务数据
class SuccessInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return res.data?.data
  }
}

// 业务失败:统一错误结构,供调用方 .catch 处理
class ErrorInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return {
      code: res.data?.code,
      message: res.data?.message ?? '请求失败',
      raw: res.data,
    }
  }
}

// 网络层 / 适配器层异常:兜底上报
class ExceptionInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    console.error('[request exception]', res)
  }
}
```

## 适配器

适配器负责把 `RequestService` 的抽象请求转换为底层 HTTP 客户端调用。库内提供开箱即用的 `AxiosAdapter`,也可自行实现 `RequestAdapter` 接口对接任意运行时。

### 使用 AxiosAdapter

```ts
import { AxiosAdapter } from '@gopowerteam/request/adapters'

setup({
  // ...其余配置
  adapter: new AxiosAdapter(),
})
```

`AxiosAdapter` 行为要点:

- 复用一个 axios 实例,默认 `Content-Type: application/json`
- `FormData` / `URLSearchParams` → 自动让出 `Content-Type`,由浏览器 / axios 补 boundary
- `Blob` → 兜底 `application/octet-stream`
- 调用方显式设置 `Content-Type` 时绝对优先(大小写不敏感)
- 查询参数默认 `arrayFormat: 'repeat'`、`skipNulls`、`allowDots`,可通过 `setup` 的 `qs` 选项覆盖

### 自定义适配器

```ts
import type {
  AdapterResponse,
  RequestAdapter,
  RequestAdapterOptions,
  RequestSetupConfig,
} from '@gopowerteam/request'

class FetchAdapter implements RequestAdapter {
  private config!: RequestSetupConfig

  injectConfig(config: RequestSetupConfig) {
    this.config = config
  }

  async request(options: RequestAdapterOptions): Promise<AdapterResponse> {
    const res = await fetch(`${options.baseURL}${options.pathURL}`, {
      method: options.method,
      headers: options.headers as Record<string, string>,
      body: options.paramsBody ? JSON.stringify(options.paramsBody) : undefined,
    })

    return {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      data: await res.json(),
    }
  }

  transformResponse(response: AdapterResponse): AdapterResponse {
    return response
  }

  transformException(exception: any): AdapterResponse {
    return {
      data: {},
      status: exception?.status ?? 400,
      statusText: exception?.statusText ?? '',
      headers: {},
    }
  }
}
```

## API 导出

### 主入口 `@gopowerteam/request`

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `setup` | `(config: RequestSetupConfig) => void` | 安装全局配置 |
| `RequestService` | 类 | 单例请求服务,`getInstance()` 获取实例 |
| `RequestMethod` | 枚举 | `Get` / `Post` / `Put` / `Delete` / `Patch` / `Options` / `Head` |
| `RequestGenerateType` | 枚举 | `Request` / `URL`,配合生成器使用 |
| `RequestSetupConfig` | 接口 | 全局配置 |
| `RequestSendOptions` | 接口 | 单次请求选项 |
| `RequestPlugin` | 接口 | 插件契约 |
| `PluginLifecycle` | 枚举 | 插件生命周期标识 |
| `ResponseInterceptor` | 接口 | 响应拦截器契约 |
| `RequestAdapter` | 接口 | 适配器契约 |
| `RequestAdapterOptions` | 接口 | 传给适配器的请求选项 |
| `AdapterResponse` | 接口 | 适配器返回的统一响应结构 |

### 适配器入口 `@gopowerteam/request/adapters`

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `AxiosAdapter` | 类 | 基于 axios 的内置适配器 |

## 相关生态

- [`@gopowerteam/request-generate`](https://www.npmjs.com/package/@gopowerteam/request-generate) —— OpenAPI / Swagger 规范自动生成类型安全的 Service 代码(CLI + Vite 插件),生成的代码直接消费本库的 `RequestService`。

## License

MIT (c) [gopowerteam](https://github.com/gopowerteam)

仓库地址:[github.com/gopowerteam/package.request](https://github.com/gopowerteam/package.request)(本包位于 `packages/request`)
