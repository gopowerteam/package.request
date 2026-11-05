# 请求服务 API

`RequestService.getInstance().send(options, plugins?)` 是请求入口;`toURL(options, plugins?)` 只生成 URL 不发请求。

## RequestSendOptions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `path` | `string` | 请求路径,支持 `{id}` 形式的路径参数 |
| `method` | `RequestMethod \| string` | HTTP 方法,推荐用 `RequestMethod` 枚举 |
| `service` | `string` | 服务前缀,拼接为 `/{service}/{path}` |
| `headers` | `Record<string, string \| boolean>` | `false` 表示删除该头(axios 语义) |
| `paramsPath` | `Record<string, string \| number>` | 路径参数 |
| `paramsQuery` | `Record<string, unknown>` | 查询参数,经 `qs` 序列化 |
| `paramsBody` | `unknown` | 请求体 |
| `signal` | `AbortSignal` | 取消信号,配合 `AbortController` / [AbortService](/guide/plugins.md#请求取消) |

## 常用形态

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

**编码约定**:路径参数值必须传**原始未编码值** —— 内部统一做 URL 编码,传入已编码值会被二次编码(`a%20b` → `a%2520b`);值为 `null` / `undefined` 时占位符保留原样;占位符重复出现时会全部替换。

### 服务前缀

```ts
await request.send({
  service: 'user-service',
  path: '/users',
  method: RequestMethod.Get,
})
// GET {gateway}/user-service/users
```

## 生成 URL(toURL)

不发起请求,按配置产出完整 URL,常用于下载、外链跳转:

```ts
const url = request.toURL({
  path: '/export',
  method: RequestMethod.Get,
  paramsQuery: { type: 'csv', ids: [1, 2, 3] },
})
// https://api.example.com/export?type=csv&ids=1&ids=2&ids=3
```

> `toURL` 同样会触发插件的 `before`(副作用),但没有响应生命周期。

## `send<T>` 响应类型泛型

`send<T>` 声明返回值类型(`Promise<T>`):

```ts
interface UserInfo {
  id: number
  name: string
}

const user = await request.send<UserInfo>({ /* ... */ })
```

语义要点:

- `T` 是**信任断言** —— 运行时数据经用户拦截器(`success.exec`)转换产出,类型系统无法验证其与 `T` 一致
- 直调场景推荐显式声明;[`request-generate`](/generate/getting-started.md) 生成的 Service 方法自动携带类型
- 不标注时默认 `any`,与历史行为兼容

## 自定义适配器

实现 `RequestAdapter` 接口即可对接任意运行时(fetch、小程序等):

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

  // 原始响应转统一响应结构(参数为 unknown,实现内部自行收窄)
  transformResponse(response: unknown): AdapterResponse {
    return response as AdapterResponse
  }

  transformException(exception: unknown): AdapterResponse {
    return {
      data: {},
      status: 400,
      statusText: '',
      headers: {},
    }
  }
}
```

接口要点(v0.5.0 起):

- `request()` 返回 `Promise<unknown>`,响应/异常经 `transformResponse` / `transformException` 收敛为统一的 `AdapterResponse`
- 两个 transform 的参数为 `unknown`,适配器实现内部自行收窄为底层客户端的真实类型
- `AdapterResponse.data` 为 `Record<string, any>` —— 拦截器可直接取值

内置的 [`AxiosAdapter`](/guide/getting-started.md) 已覆盖 axios 场景,含智能 Content-Type(FormData/Blob/URLSearchParams 自动推断,显式设置绝对优先)。

## API 导出速查

### 主入口 `@gopowerteam/request`

`setup` / `RequestService` / `RequestMethod` / `RequestGenerateType` / `RequestSetupConfig` / `RequestSendOptions` / `RequestPlugin` / `PluginLifecycle` / `ResponseInterceptor` / `RequestAdapter` / `RequestAdapterOptions` / `AdapterResponse`

### 子路径

| 子路径 | 导出 |
| --- | --- |
| `@gopowerteam/request/adapters` | `AxiosAdapter` |
| `@gopowerteam/request/plugins` | `AbortService` |
| `@gopowerteam/request/observable` | `ObservableGenerateRequestService`(见 [Observable 模式](/guide/observable.md))|
