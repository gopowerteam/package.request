import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { Generate } from '../generate'
import { getCamelName } from './get-camel-name'

/**
 * 把用户 resolve 返回的名称消毒为合法 PascalCase 标识符
 * 防止连字符/特殊字符导致生成的类名语法错误
 */
function sanitizeServiceName(name: string): string
function sanitizeServiceName(name: string[]): string[]
function sanitizeServiceName(name: string | string[]): string | string[]
function sanitizeServiceName(name: string | string[]): string | string[] {
  if (Array.isArray(name)) {
    return name.map(item => getCamelName(item))
  }
  return getCamelName(name)
}

/**
 * 获取服务名称
 * @param path
 * @param method
 * @param operationObject
 * @param tags
 * @returns 服务名称
 */
export function getServiceName(
  path: string,
  method: string,
  operationObject: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject,
  tags: OpenAPIV2.TagObject[] | OpenAPIV3.TagObject[],
): string | string[] {
  const resolve = Generate.options?.exportServices?.serviceResolve

  if (resolve) {
    const result = resolve({ path, method, object: operationObject, tags })
    // 用户返回的名称必须消毒为合法 PascalCase 标识符,
    // 否则生成的类名会包含连字符等非法字符导致语法错误
    return sanitizeServiceName(result)
  }
  else {
    return operationObject.tags?.map(tag => getCamelName(tag)) || 'Default'
  }
}
