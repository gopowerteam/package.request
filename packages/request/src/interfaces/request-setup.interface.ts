import type { IStringifyOptions } from 'qs'
import { RequestAdapter } from './request-adapter.interface'
import { ResponseInterceptor } from './response-interceptor.interface'
import { RequestPlugin } from './request-plugin.interface'

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
