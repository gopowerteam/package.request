import { RequestMethod } from './request-send.interface'
import { RequestSetupConfig } from './request-setup.interface'

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
  request(options: RequestAdapterOptions): Promise<any>

  /**
   * 转换Response
   * @param any
   */
  transformResponse(response: any): AdapterResponse

  /**
   * 转换Exception
   * @param any
   */
  transformException(response: any): AdapterResponse
}

export interface RequestAdapterOptions {
  baseURL: string
  pathURL: string
  headers: Record<string, string>
  method: RequestMethod | string
  paramsQuery?: Record<string, any>
  paramsBody?: any
  extraParams?: any
}

export interface AdapterResponse {
  data: Record<string, any>
  status: number
  statusText: string
  headers: AdapterResponseHeaders
}

export type AdapterResponseHeaders = Record<
  string,
  string | string[] | number | boolean | undefined
>
