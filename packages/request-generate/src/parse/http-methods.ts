/**
 * OpenAPI 规范支持的 HTTP 方法集合
 * V2 含 7 个(无 TRACE),V3 含 8 个(含 TRACE),此处取并集
 */
export const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
])

/**
 * 判断字符串是否为合法 HTTP 方法
 */
export function isHttpMethod(method: string): boolean {
  return HTTP_METHODS.has(method.toLowerCase())
}
