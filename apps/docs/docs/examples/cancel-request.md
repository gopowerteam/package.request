# 示例:请求取消

三种取消姿势:标准 `AbortSignal`、`AbortService` 作用域、搜索防抖场景。

## 1. 手动 AbortSignal

```ts
const controller = new AbortController()

request.send({
  path: '/users',
  method: RequestMethod.Get,
  signal: controller.signal,
})

// 需要时终止
controller.abort()
```

被取消的请求走异常流程,`AdapterResponse.canceled === true`:

```ts
request.send({ path: '/users', method: RequestMethod.Get, signal: controller.signal })
  .catch((res: AdapterResponse) => {
    if (res.canceled) return // 手动取消,静默
    // 真实错误处理
  })
```

## 2. AbortService 作用域(推荐)

每个 `AbortService` 实例是一个取消作用域,`abort()` 终止该实例全部进行中请求;请求结束后自动回收,实例可放心复用:

```ts
import { AbortService } from '@gopowerteam/request/plugins'

const pageAbort = new AbortService()

// 同一作用域挂载多个请求
meituan.AccountService.getBalance(accountId, [pageAbort])
order.OrderService.listByAccount({ accountId }, [pageAbort])

// 一次性终止本作用域全部请求(如页面离开)
pageAbort.abort()
```

### Vue 组件卸载清理

```ts
import { onBeforeUnmount } from 'vue'
import { AbortService } from '@gopowerteam/request/plugins'

const requestAbort = new AbortService()

// 生成的每个方法都暴露 requestPlugins 参数
meituan.AccountService.getBalance(accountId, [requestAbort])
order.OrderService.listByAccount({ accountId }, [requestAbort])

onBeforeUnmount(() => requestAbort.abort())
```

## 3. 搜索防抖场景

每次发新请求前 `abort()` 旧请求,同一实例反复使用:

```ts
const searchAbort = new AbortService()

async function search(keyword: string) {
  searchAbort.abort() // 终止上一次进行中的请求

  try {
    results.value = await SearchService.query({ keyword }, [searchAbort])
  }
  catch (res: any) {
    if (!res.canceled) {
      console.error(res.data) // 取消静默,真实错误才提示
    }
  }
}
```

## 4. 拦截器中静默取消

取消也可在异常拦截器里统一静默:

```ts
import type { AdapterResponse, ResponseInterceptor } from '@gopowerteam/request'

export class ExceptionInterceptors implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    if (res.canceled) {
      return res // 手动取消,静默处理
    }
    console.error('[request exception]', res)
    return res
  }
}
```

## 注意事项

- `toURL()` 同样会触发插件 `before`,但没有响应生命周期 —— URL 生成场景无需传入 AbortService
- 核心层只透传 `signal`;自定义适配器(如小程序)需自行桥接 abort(参考仓库 `packages/request/README.md`)
- 运行时前提:`AbortController`(浏览器 / Node 18+ / 较新微信基础库均内置)
