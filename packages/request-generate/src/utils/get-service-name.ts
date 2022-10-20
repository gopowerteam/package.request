import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { Generate } from '../generate'
import { getCamelName } from './get-camel-name'

/**
 * 获取服务名称
 * @param path
 * @param method
 * @param operationObject
 * @param tags
 * @param options
 * @returns
 */
export function getServiceName(
  path: string,
  method: string,
  operationObject: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject,
  tags: OpenAPIV2.TagObject[] | OpenAPIV3.TagObject[]
): string | string[] {
  const resolve = Generate.options?.exportServices?.serviceResolve

  if (resolve) {
    return resolve(path, method, operationObject, tags)
  } else {
    return operationObject.tags?.map((tag) => getCamelName(tag)) || 'Default'
  }
}
