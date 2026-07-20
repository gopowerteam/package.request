/**
 * Content-Type 头部工具函数
 * 用于 AxiosAdapter 按运行时 body 类型推断 Content-Type
 */

/**
 * 检测调用方是否已显式设置 Content-Type(大小写不敏感)
 */
export function hasContentTypeHeader(
  headers: Record<string, unknown>,
): boolean {
  return Object.keys(headers).some(key => key.toLowerCase() === 'content-type')
}

/**
 * 判定值是否为 FormData 实例
 */
export function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

/**
 * 判定值是否为 URLSearchParams 实例
 */
export function isURLSearchParams(value: unknown): value is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams
}

/**
 * 判定值是否为 Blob 实例
 */
export function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob
}
