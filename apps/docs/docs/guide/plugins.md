# 插件系统与请求取消

## 插件契约

实现 `RequestPlugin` 接口即可织入请求生命周期。插件既可以配置为全局插件,也可以按请求传入 `send` / `toURL` 的第二个参数。

| 钩子 | 触发时机 | 用途 |
| --- | --- | --- |
| `before(options, appendParams)` | 请求发出前 | 改写请求参数、注入 header |
| `after(response, options)` | 响应成功转换后 | 成功分支副作用 |
| `catch(response, options)` | 响应异常转换后 | 异常分支副作用 |

### 执行顺序

全局插件与请求级插件都会执行:各阶段均为**先全局、后请求级**,依配置顺序执行。

### appendParams:向适配器追加配置

`before` 的第二个参数可向底层适配器追加额外配置(axios 场景即 axios config 级展开,如 `responseType`、`timeout`):

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

### 常见示例

全局注入鉴权 Token:

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

请求级 Loading 切换:

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

## 响应拦截器

实现 `ResponseInterceptor` 接口,四类拦截器各司其职:

```ts
import type { AdapterResponse, ResponseInterceptor } from '@gopowerteam/request'

// 判定业务是否成功(决定走 success 还是 error)
class StatusInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return res.status >= 200 && res.status < 300 && res.data?.code === 0
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
    return { code: res.data?.code, message: res.data?.message ?? '请求失败' }
  }
}

// 网络 / 适配器层异常:兜底上报
class ExceptionInterceptor implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    console.error('[request exception]', res)
  }
}
```

## 请求取消

### 方式一:手动传入 AbortSignal

`RequestSendOptions` 支持标准 `AbortSignal`:

```ts
const controller = new AbortController()

request.send({
  path: '/users',
  method: RequestMethod.Get,
  signal: controller.signal,
})

controller.abort()
```

被取消的请求走异常流程,`AdapterResponse.canceled` 标记为 `true`,可据此静默处理:

```ts
request.send({ path: '/users', method: RequestMethod.Get, signal: controller.signal })
  .catch((res: AdapterResponse) => {
    if (res.canceled) return
    // 处理真实错误
  })
```

### 方式二:AbortService 作用域取消(推荐)

从子路径 `@gopowerteam/request/plugins` 导入。每个实例是一个**取消作用域**,`abort()` 终止该实例发起的所有进行中请求;请求结束后自动回收,可放心复用:

```ts
import { AbortService } from '@gopowerteam/request/plugins'

const searchAbort = new AbortService()

async function search(keyword: string) {
  searchAbort.abort() // 终止上一次进行中的请求

  try {
    results.value = await SearchService.query({ keyword }, [searchAbort])
  }
  catch (res: any) {
    if (!res.canceled) console.error(res.data) // 取消静默,真实错误才提示
  }
}
```

配合 Vue 组件生命周期清理全部进行中请求:

```ts
import { onBeforeUnmount } from 'vue'

const requestAbort = new AbortService()

// 每个生成方法都暴露 requestPlugins 参数(见示例篇)
meituan.AccountService.getBalance(accountId, [requestAbort])

onBeforeUnmount(() => requestAbort.abort())
```

> 注意:`toURL()` 也会触发插件 `before`,但没有响应生命周期;URL 生成场景无需传入 AbortService。
>
> 运行时前提:依赖 `AbortController`(浏览器 / Node 18+ / 较新微信基础库均内置);不使用 signal 的自定义适配器不受影响。自定义适配器需自行桥接 signal(参考仓库 `packages/request/README.md` 的小程序示例)。
