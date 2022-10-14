/**
 * 请求方法类型
 */
export enum RequestMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
  Options = "OPTIONS",
  Head = "HEAD",
  Patch = "PATCH",
}

export interface RequestSendOptions {
  path: string;
  method: RequestMethod;
  params?: any;
  data?: any;
  headers?: Record<string, string>;
}
