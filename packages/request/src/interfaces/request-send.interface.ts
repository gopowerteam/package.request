/**
 * 请求方法类型
 */
export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Options = 'OPTIONS',
  Head = 'HEAD',
  Patch = 'PATCH'
}

export interface RequestSendOptions {
  service?: string
  path: string
  method: RequestMethod | string
  headers?: Record<string, string>
  paramsPath?: Record<string, string | number>
  paramsQuery?: Record<string, any>
  paramsBody?: any
}
