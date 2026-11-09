import type {
  AdapterResponse,
  AdapterResponseHeaders,
  RequestAdapter,
  RequestAdapterOptions,
} from '../interfaces/request-adapter.interface'
import type {
  RequestSetupConfig,
} from '../interfaces/request-setup.interface'
import {
  isBlob,
  isFormData,
  isURLSearchParams,
} from '../utils/content-type'
import { DEFAULT_QUERY_OPTIONS, stringify } from '../utils/query-string'

/**
 * fetch 适配器专用配置
 *
 * 与 axios 的 `paramsSerializer` / `transformResponse` 等价能力,
 * 通过 `RequestSetupConfig.fetch` 传入。
 */
export interface FetchAdapterConfig {
  /** 响应体解析策略,默认 'auto'(按 Content-Type 推断) */
  responseType?: 'auto' | 'json' | 'text' | 'blob' | 'arraybuffer'
  /** 自定义请求实现,默认使用全局 fetch(便于测试或注入 polyfill) */
  fetch?: typeof fetch
}

/**
 * 请求方法中不允许携带 body 的集合(RFC 9110)
 */
const BODYLESS_METHODS = new Set(['GET', 'HEAD'])

/**
 * 非 2xx 响应抛出的异常
 *
 * 保留原始 Response 与已解析的 body,供 transformException 还原真实状态码。
 */
export class ResponseError extends Error {
  public readonly response: Response
  public readonly data: Record<string, any>
  public readonly headers: AdapterResponseHeaders

  constructor(response: Response, data: Record<string, any>, headers: AdapterResponseHeaders) {
    super(`Request failed with status code ${response.status}`)
    this.name = 'ResponseError'
    this.response = response
    this.data = data
    this.headers = headers
  }
}

/**
 * 从 extraParams 中提取 fetch 适配器认识的字段,
 * 其余字段原样合并进 RequestInit(与 axios 的 config 级展开语义对齐)。
 */
const EXTRA_PARAM_KEYS = [
  'cache',
  'credentials',
  'mode',
  'redirect',
  'referrer',
  'referrerPolicy',
  'integrity',
  'keepalive',
  'duplex',
] as const

export class FetchAdapter implements RequestAdapter {
  private config: RequestSetupConfig

  public injectConfig(config: RequestSetupConfig) {
    this.config = config
  }

  /**
   * 获取 fetch 实现(优先取配置注入的实现)
   */
  private getFetch(): typeof fetch {
    const resolved = this.config?.fetch ?? globalThis.fetch

    if (typeof resolved !== 'function') {
      throw new TypeError('当前环境不支持 fetch,请注入 fetch 实现')
    }

    return resolved
  }

  /**
   * 拼接完整 URL,并把 query 参数序列化后附加
   */
  private buildURL(baseURL: string, pathURL: string, paramsQuery?: Record<string, unknown>): string {
    const url = `${baseURL}${pathURL}`

    if (!paramsQuery) {
      return url
    }

    const queryString = stringify(paramsQuery, {
      ...DEFAULT_QUERY_OPTIONS,
      ...(this.config?.qs || {}),
    })

    if (!queryString) {
      return url
    }

    return `${url}${url.includes('?')
      ? '&'
      : '?'}${queryString}`
  }

  /**
   * 构造请求头
   *
   * - 布尔 false 表示删除该头(与 axios 语义一致)
   * - 未显式设置 Content-Type 时,按运行时 body 类型推断
   */
  private buildHeaders(
    headers: Record<string, string | boolean> = {},
    paramsBody: unknown,
  ): Headers {
    const result = new Headers()

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== false) {
        result.set(key, String(value))
      }
    })

    const inferred = this.inferContentType(paramsBody)

    if (inferred === false) {
      // FormData / URLSearchParams:交给运行时自动补 boundary / charset
      return result
    }

    if (inferred && !result.has('Content-Type')) {
      result.set('Content-Type', inferred)
    }

    return result
  }

  /**
   * 按运行时 body 类型推断 Content-Type
   *
   * - 调用方显式设置 → 不覆盖(由 buildHeaders 的 has 判断保证)
   * - FormData / URLSearchParams → false(让 fetch/浏览器自动补 boundary)
   * - Blob → 使用其自带 type,缺失时回落 application/octet-stream
   * - 其他 → application/json(与 axios 实例默认头一致)
   */
  private inferContentType(paramsBody: unknown): string | false | undefined {
    if (paramsBody === undefined || paramsBody === null) {
      return undefined
    }

    if (isFormData(paramsBody) || isURLSearchParams(paramsBody)) {
      return false
    }

    if (isBlob(paramsBody)) {
      return paramsBody.type || 'application/octet-stream'
    }

    return 'application/json'
  }

  /**
   * 构造请求体
   *
   * - GET / HEAD 不携带 body
   * - FormData / Blob / URLSearchParams / ArrayBuffer / TypedArray / ReadableStream 原样透传
   * - 字符串原样透传(调用方已自行序列化)
   * - 其他对象 → JSON.stringify
   */
  private buildBody(method: string, paramsBody: unknown): BodyInit | undefined {
    if (paramsBody === undefined || paramsBody === null) {
      return undefined
    }

    if (BODYLESS_METHODS.has(method.toUpperCase())) {
      return undefined
    }

    if (
      typeof paramsBody === 'string'
      || isFormData(paramsBody)
      || isBlob(paramsBody)
      || isURLSearchParams(paramsBody)
      || paramsBody instanceof ArrayBuffer
      || ArrayBuffer.isView(paramsBody)
      || (typeof ReadableStream !== 'undefined' && paramsBody instanceof ReadableStream)
    ) {
      return paramsBody as BodyInit
    }

    return JSON.stringify(paramsBody)
  }

  /**
   * 合并 extraParams:已知字段归入 RequestInit,`responseType` 单独交给解析阶段
   */
  private mergeExtraParams(extraParams: Record<string, unknown> = {}) {
    const init: Record<string, unknown> = {}
    let responseType: FetchAdapterConfig['responseType']

    Object.entries(extraParams).forEach(([key, value]) => {
      if (key === 'responseType') {
        responseType = value as FetchAdapterConfig['responseType']
        return
      }

      // 与 axios config 对齐:curl/agent/proxy 等 axios 专有字段在 fetch 下无意义,直接忽略
      if (key === 'data' || key === 'params' || key === 'url' || key === 'method' || key === 'headers') {
        return
      }

      if ((EXTRA_PARAM_KEYS as readonly string[]).includes(key) || key === 'signal') {
        init[key] = value
      }
    })

    return { init, responseType }
  }

  /**
   * 发送请求
   *
   * timeout 语义与 axios 对齐:覆盖连接 + 响应体读取全过程。
   */
  public async request({
    baseURL,
    pathURL,
    headers,
    method,
    paramsQuery,
    paramsBody,
    extraParams,
    signal,
  }: RequestAdapterOptions) {
    const fetchImpl = this.getFetch()
    const upperMethod = method.toUpperCase()
    const { init: extraInit, responseType: extraResponseType } = this.mergeExtraParams(extraParams)

    // 组合外部 signal 与超时 signal
    const timeout = this.config?.timeout
    const controller = new AbortController()
    const externalSignal = (extraInit.signal as AbortSignal | undefined) ?? signal

    const onExternalAbort = () => controller.abort()
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort()
      }
      else {
        externalSignal.addEventListener('abort', onExternalAbort, { once: true })
      }
    }

    const timer = timeout && timeout > 0
      ? setTimeout(() => controller.abort(), timeout)
      : undefined

    // 调用方 signal 已中止时,fetch 未必会抛 AbortError(引擎差异),
    // 这里主动抛出统一的中止异常,保证 transformException 能标记 canceled
    if (externalSignal?.aborted) {
      if (timer) {
        clearTimeout(timer)
      }
      throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })
    }

    try {
      const response = await fetchImpl(this.buildURL(baseURL, pathURL, paramsQuery), {
        ...extraInit,
        method: upperMethod,
        headers: this.buildHeaders(headers, paramsBody),
        body: this.buildBody(upperMethod, paramsBody),
        signal: controller.signal,
      })

      const data = await this.parseBody(response, extraResponseType)
      const responseHeaders = this.serializeHeaders(response.headers)

      // 与 axios 一致:非 2xx 视为异常,走 transformException
      if (!response.ok) {
        throw new ResponseError(response, data, responseHeaders)
      }

      return { response, data, headers: responseHeaders }
    }
    finally {
      if (timer) {
        clearTimeout(timer)
      }
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }
  }

  /**
   * 解析响应体
   */
  private async parseBody(
    response: Response,
    override?: FetchAdapterConfig['responseType'],
  ): Promise<Record<string, any>> {
    const responseType = override
      ?? (this.config as FetchAdapterConfig & RequestSetupConfig)?.responseType
      ?? 'auto'

    if (responseType === 'blob') {
      return await response.blob() as any
    }

    if (responseType === 'arraybuffer') {
      return await response.arrayBuffer() as any
    }

    if (responseType === 'text') {
      return await response.text() as any
    }

    if (responseType === 'json') {
      return await this.readJSON(response)
    }

    // auto:按 Content-Type 推断
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json') || contentType.includes('+json')) {
      return await this.readJSON(response)
    }

    if (contentType.startsWith('text/')) {
      return await response.text() as any
    }

    if (contentType.startsWith('application/octet-stream')) {
      return await response.blob() as any
    }

    // 未知类型按文本读取,避免消费方拿到不可读的 stream
    return await response.text() as any
  }

  /**
   * 读取 JSON,空响应体返回 {}
   */
  private async readJSON(response: Response): Promise<Record<string, any>> {
    const text = await response.text()

    if (!text) {
      return {}
    }

    try {
      return JSON.parse(text)
    }
    catch {
      return text as any
    }
  }

  /**
   * 将 Headers 转换为普通对象
   */
  private serializeHeaders(headers: Headers): AdapterResponseHeaders {
    const result: AdapterResponseHeaders = {}

    headers.forEach((value, key) => {
      result[key] = value
    })

    return result
  }

  /**
   * 转换Response
   *
   * 入参为 request() 产出的中间结构 `{ response, data, headers }`
   */
  public transformResponse(response: unknown): AdapterResponse {
    const raw = response as {
      response?: Response
      data?: any
      headers?: AdapterResponseHeaders
    }

    return {
      data: (raw?.data ?? {}) as Record<string, any>,
      status: raw?.response?.status ?? 200,
      statusText: raw?.response?.statusText ?? '',
      headers: raw?.headers ?? {},
    }
  }

  /**
   * 转换Exception
   *
   * - 非 2xx:携带真实的 status / statusText / headers 与已解析的 body
   * - AbortError:标记 canceled
   * - 其他网络异常:回落 400
   */
  public transformException(exception: unknown): AdapterResponse {
    const err = exception as {
      response?: Response
      data?: any
      headers?: AdapterResponseHeaders
      name?: string
      message?: string
    }

    const response: AdapterResponse = {
      data: (err?.data ?? {}) as Record<string, any>,
      statusText: err?.response?.statusText || '',
      status: err?.response?.status || 400,
      headers: err?.headers || {},
    }

    if (this.isAbortError(exception, err)) {
      response.canceled = true
    }

    return response
  }

  /**
   * 判定异常是否由取消(signal / timeout)引起
   */
  private isAbortError(exception: unknown, err?: { name?: string, message?: string }): boolean {
    if (err?.name === 'AbortError') {
      return true
    }

    if (err?.message?.includes('aborted')) {
      return true
    }

    return (
      typeof DOMException !== 'undefined'
      && exception instanceof DOMException
      && exception.name === 'AbortError'
    )
  }
}
