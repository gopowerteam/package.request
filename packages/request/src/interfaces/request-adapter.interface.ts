import { RequestMethod } from "./request-send.interface";

export interface RequestAdapter {
  /**
   * 发送请求
   */
  request(options: RequestAdapterOptions): Promise<any>;

  /**
   * 转换Response
   * @param any
   */
  transformResponse(response: any): AdapterResponse;
}

export interface RequestAdapterOptions {
  baseURL: string;
  pathURL: string;
  headers: Record<string, string>;
  method: RequestMethod | string;
  params: Record<string, any>;
  data: Record<string, any>;
}

export interface AdapterResponse {
  data: Record<string, any>;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
