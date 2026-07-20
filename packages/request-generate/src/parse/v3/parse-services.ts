import type { OpenAPIV3 } from 'openapi-types'
import type { Service } from '../../entities/service'
import { isHttpMethod } from '../http-methods'
import { parseService } from './parse-service'

export function parseServices(document: OpenAPIV3.Document) {
  const services: Service[] = []

  Object.entries(document.paths).forEach(([path, pathObject]) => {
    if (pathObject) {
      Object.entries(pathObject).forEach(([method, operationObject]) => {
        // 仅处理 HTTP 方法,跳过 parameters/servers/summary/description 等
        if (!isHttpMethod(method)) {
          return
        }

        parseService(
          path,
          method,
          operationObject as OpenAPIV3.OperationObject,
          document.tags || [],
          services,
        )
      })
    }
  })

  return services
}
