import type { IStringifyOptions } from 'qs'
import type { RequestAdapter } from './request-adapter.interface'
import type { RequestPlugin } from './request-plugin.interface'
import type { ResponseInterceptor } from './response-interceptor.interface'

export interface RequestSetupConfig {
  gateway: string
  timeout?: number
  qs?: IStringifyOptions
  adapter?: RequestAdapter
  interceptors: {
    status: ResponseInterceptor
    success: ResponseInterceptor
    error: ResponseInterceptor
    exception: ResponseInterceptor
  }
  plugins: RequestPlugin[]
}
