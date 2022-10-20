import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { Generate } from '../generate'

/**
 * 获取服务名称
 * @param path
 * @param method
 * @param operationObject
 * @returns
 */
export function getOperationName(
  path: string,
  method: string,
  operationObject: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
): string {
  const resolve = Generate.options?.exportServices?.operationResolve

  if (resolve) {
    return resolve(path, method, operationObject)
  } else {
    return operationObject.operationId || ''
  }
}
