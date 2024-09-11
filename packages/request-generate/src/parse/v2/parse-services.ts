import type { OpenAPIV2 } from 'openapi-types'
import { parseService } from './parse-service'
import type { Service } from '../../entities/service'

export function parseServices(document: OpenAPIV2.Document) {
  const services: Service[] = []

  Object.entries(document.paths).forEach(([path, pathObject]) => {
    if (pathObject) {
      Object.entries(pathObject).forEach(([method, operationObject]) => {
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
