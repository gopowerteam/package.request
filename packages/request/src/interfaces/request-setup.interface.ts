import type { IStringifyOptions } from 'qs'
import { RequestAdapter } from './request-adapter.interface'
import { ResponseInterceptor } from './response-interceptor.interface'
import { RequestPlugin } from './request-plugin.interface'

/**
 * 内部支持适配器
 */
type InternalAdapter = 'axios'

export interface RequestSetupConfig {
  gateway: string
  timeout?: number
  qs?: IStringifyOptions
  adapter?: InternalAdapter | RequestAdapter
  interceptors: {
    status: ResponseInterceptor
    success: ResponseInterceptor
    error: ResponseInterceptor
    exception: ResponseInterceptor
  }
  plugins: RequestPlugin[]
}
