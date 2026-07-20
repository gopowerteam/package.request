import type { OpenAPIV2 } from 'openapi-types'
import type { Service } from '../../entities/service'
import { isHttpMethod } from '../http-methods'
import { parseService } from './parse-service'

export function parseServices(document: OpenAPIV2.Document) {
  const services: Service[] = []

  Object.entries(document.paths).forEach(([path, pathObject]) => {
    if (pathObject) {
      Object.entries(pathObject).forEach(([method, operationObject]) => {
        // 仅处理 HTTP 方法,跳过 parameters 等 PathItemObject 的其他字段
        if (!isHttpMethod(method)) {
          return
        }

        parseService(
          path,
          method,
          operationObject as OpenAPIV2.OperationObject,
          document.tags || [],
          services,
        )
      })
    }
  })

  return services
}
