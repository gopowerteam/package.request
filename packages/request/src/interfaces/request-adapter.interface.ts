import type { RequestMethod } from './request-send.interface'
import type { RequestSetupConfig } from './request-setup.interface'

export interface RequestAdapter {
  /**
   *  注入全局配置文件
   * @param config
   * @returns
   */
  injectConfig?: (config: RequestSetupConfig) => void
  /**
   * 发送请求
   */
  request: (options: RequestAdapterOptions) => Promise<unknown>

  /**
   * 转换Response
   * @param response 适配器原始响应(类型由具体适配器实现内部收窄)
   */
  transformResponse: (response: unknown) => AdapterResponse

  /**
   * 转换Exception
   * @param response 适配器原始异常(类型由具体适配器实现内部收窄)
   */
  transformException: (response: unknown) => AdapterResponse
}

export interface RequestAdapterOptions {
  baseURL: string
  pathURL: string
  headers: Record<string, string | boolean>
  method: RequestMethod | string
  paramsQuery?: Record<string, unknown>
  paramsBody?: unknown
  extraParams?: Record<string, unknown>
  signal?: AbortSignal
}

export interface AdapterResponse {
  data: Record<string, any>
  status: number
  statusText: string
  headers: AdapterResponseHeaders
  canceled?: boolean
}

export type AdapterResponseHeaders = Record<
  string,
  string | string[] | number | boolean | undefined
>
