import {
  AdapterResponse,
  RequestAdapter,
  RequestAdapterOptions,
} from "../interfaces/request-adapter.interface";
import axios, { AxiosInstance } from "axios";
import { RequestService } from "../request-service";

export class AxiosAdapter implements RequestAdapter {
  private static axiosInstance: AxiosInstance;

  /**
   * 获取Axios实例
   */
  private getAxiosInstance() {
    if (!AxiosAdapter.axiosInstance) {
      AxiosAdapter.axiosInstance = axios.create({
        timeout: RequestService.config.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return AxiosAdapter.axiosInstance;
  }

  /**
   * 发送请求
   * @param options 请求参数
   * @returns AxiosResponse
   */
  public request({
    baseURL,
    pathURL,
    headers,
    method,
    params,
    data,
  }: RequestAdapterOptions) {
    const axiosInstance = this.getAxiosInstance();

    return axiosInstance.request({
      method,
      baseURL,
      headers,
      params,
      data,
      url: pathURL,
    });
  }

  /**
   * 转换Response
   * @param response
   * @returns
   */
  public transformResponse(response: any): AdapterResponse {
    return {
      data: response.data,
      statusText: response.statusText,
      status: response.status,
      headers: response.headers,
    };
  }
}
