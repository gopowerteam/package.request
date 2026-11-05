import type { AdapterResponse } from './request-adapter.interface'

export interface ResponseInterceptor {
  // exec 返回值即 send 的最终响应数据。保留 any 为下游兼容的保守选择:
  // 改 unknown 会破坏直接消费 exec 返回值的下游代码(库内部 unknown as T 仍合法)
  exec: (response: AdapterResponse) => any
}
