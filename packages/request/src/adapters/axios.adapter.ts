import {
  AdapterResponse,
  RequestAdapter,
  RequestAdapterOptions
} from '../interfaces/request-adapter.interface'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { RequestService } from '../request-service'
import * as qs from 'qs'

export class AxiosAdapter implements RequestAdapter {
  private static axiosInstance: AxiosInstance

  /**
   * 获取Axios实例
   */
  private getAxiosInstance() {
    if (!AxiosAdapter.axiosInstance) {
      AxiosAdapter.axiosInstance = axios.create({
        timeout: RequestService.config.timeout,
        headers: {
          'Content-Type': 'application/json'
        },
        paramsSerializer: {
          encode: (params) =>
            qs.stringify(
              params,
              RequestService.config.qs || {
                arrayFormat: 'indices',
                skipNulls: true,
                allowDots: true,
                encodeValuesOnly: true,
                encode: true
              }
            )
        }
      })
    }

    return AxiosAdapter.axiosInstance
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
    paramsQuery,
    paramsBody
  }: RequestAdapterOptions) {
    const axiosInstance = this.getAxiosInstance()

    return axiosInstance.request({
      method,
      baseURL,
      headers,
      params: paramsQuery,
      data: paramsBody,
      url: pathURL
    })
  }

  /**
   * 转换Response
   * @param response
   * @returns
   */
  public transformResponse(response: AxiosResponse): AdapterResponse {
    return {
      data: response.data,
      statusText: response.statusText,
      status: response.status,
      headers: response.headers
    }
  }

  /**
   * 转换Response
   * @param response
   * @returns
   */
  public transformException(exception: AxiosError): AdapterResponse {
    return {
      data: exception.response?.data || {},
      statusText: exception.response?.statusText || '',
      status: exception.response?.status || 400,
      headers: exception.response?.headers || {}
    }
  }
}
