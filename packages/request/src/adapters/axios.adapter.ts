import axios from 'axios'
import * as qs from 'qs'
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { RequestSetupConfig } from '../interfaces'
import type {
  AdapterResponse,
  AdapterResponseHeaders,
  RequestAdapter,
  RequestAdapterOptions,
} from '../interfaces/request-adapter.interface'

export class AxiosAdapter implements RequestAdapter {
  private static axiosInstance: AxiosInstance
  private config: RequestSetupConfig

  public injectConfig(config: RequestSetupConfig) {
    this.config = config
  }

  /**
   * 获取Axios实例
   */
  private getAxiosInstance() {
    if (!AxiosAdapter.axiosInstance) {
      AxiosAdapter.axiosInstance = axios.create({
        timeout: this.config?.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
        paramsSerializer: {
          serialize: params =>
            qs.stringify(
              params,
              this.config?.qs || {
                arrayFormat: 'repeat',
                skipNulls: true,
                allowDots: true,
                encodeValuesOnly: true,
                encode: true,
                sort: (a: string, b: string) => a.localeCompare(b),
                filter: (_, value) =>
                  ['', undefined, null].includes(value)
                    ? undefined
                    : value,
              },
            ),
        },
      })
    }

    return AxiosAdapter.axiosInstance
  }

  /**
   * 发送请求
   * @returns AxiosResponse
   */
  public request({
    baseURL,
    pathURL,
    headers,
    method,
    paramsQuery,
    paramsBody,
    extraParams = {},
  }: RequestAdapterOptions) {
    const axiosInstance = this.getAxiosInstance()

    return axiosInstance.request({
      method,
      baseURL,
      headers,
      params: paramsQuery,
      data: paramsBody,
      url: pathURL,
      ...extraParams,
    })
  }

  /**
   * 转换Response
   * @param response
   * @returns AdapterResponse
   */
  public transformResponse(response: AxiosResponse): AdapterResponse {
    return {
      data: response.data,
      statusText: response.statusText,
      status: response.status,
      headers: response.headers as AdapterResponseHeaders,
    }
  }

  /**
   * 转换Response
   * @returns AdapterResponse
   */
  public transformException(exception: AxiosError): AdapterResponse {
    return {
      data: exception.response?.data || {},
      statusText: exception.response?.statusText || '',
      status: exception.response?.status || 400,
      headers: (exception.response?.headers as AdapterResponseHeaders) || {},
    }
  }
}
