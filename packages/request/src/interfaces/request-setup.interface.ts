import type { QueryStringifyOptions } from '../utils/query-string'
import type { RequestAdapter } from './request-adapter.interface'
import type { RequestPlugin } from './request-plugin.interface'
import type { ResponseInterceptor } from './response-interceptor.interface'

export interface RequestSetupConfig {
  gateway: string
  timeout?: number
  qs?: QueryStringifyOptions
  adapter?: RequestAdapter
  /**
   * 自定义 fetch 实现(FetchAdapter 使用,默认 globalThis.fetch)
   */
  fetch?: typeof fetch
  /**
   * FetchAdapter 的响应体解析策略,默认 'auto'(按 Content-Type 推断)
   */
  responseType?: 'auto' | 'json' | 'text' | 'blob' | 'arraybuffer'
  interceptors: {
    status: ResponseInterceptor
    success: ResponseInterceptor
    error: ResponseInterceptor
    exception: ResponseInterceptor
  }
  plugins: RequestPlugin[]
}
