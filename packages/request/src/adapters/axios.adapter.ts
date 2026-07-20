import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { RequestSetupConfig } from '../interfaces'
import type {
  AdapterResponse,
  AdapterResponseHeaders,
  RequestAdapter,
  RequestAdapterOptions,
} from '../interfaces/request-adapter.interface'
import axios from 'axios'
import * as qs from 'qs'
import {
  hasContentTypeHeader,
  isBlob,
  isFormData,
  isURLSearchParams,
} from '../utils/content-type'

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
      headers: this.applyContentTypeHeader(headers, paramsBody),
      params: paramsQuery,
      data: paramsBody,
      url: pathURL,
      ...extraParams,
    })
  }

  /**
   * 按运行时 body 类型推断 Content-Type
   * - 调用方显式设置 → 不覆盖(守卫 1)
   * - FormData / URLSearchParams → false(让 axios/浏览器自动补 boundary / charset)
   * - Blob → application/octet-stream(A 端兜底,B 端若已注入精确类型会走守卫 1)
   * - 其他(对象/数组/字符串/undefined)→ 不写头,沿用 axios 实例默认的 application/json
   */
  private applyContentTypeHeader(
    headers: Record<string, string | boolean>,
    paramsBody: unknown,
  ): Record<string, string | boolean> {
    const result: Record<string, string | boolean> = { ...headers }

    // 守卫 1:调用方显式设置了 Content-Type(大小写不敏感)→ 完全尊重
    if (hasContentTypeHeader(result)) {
      return result
    }

    // 仅对明确的非 JSON 运行时类型介入
    if (isFormData(paramsBody) || isURLSearchParams(paramsBody)) {
      result['Content-Type'] = false
    }
    else if (isBlob(paramsBody)) {
      result['Content-Type'] = 'application/octet-stream'
    }

    // 其他情况不写头 → axios 实例默认 application/json 自动生效
    return result
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
