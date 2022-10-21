import type { OpenAPIV2 } from 'openapi-types'
import { Service } from '../../entities/service'
import { getServiceName } from '../../utils/get-service-name'
import { parseOperation } from './parse-operation'

export function parseService(
  path: string,
  method: string,
  operationObject: OpenAPIV2.OperationObject,
  tags: OpenAPIV2.TagObject[],
  services: Service[]
) {
  const toNames = (name: string | string[]) =>
    Array.isArray(name) ? name : [name]

  const names = toNames(
    getServiceName(
      path,
      method,
      operationObject as OpenAPIV2.OperationObject,
      tags || []
    )
  )

  // 生成Operation
  const operation = parseOperation(path, method, operationObject)

  // 生成Service
  names.forEach((name) => {
    let service = services.find((service) => service.name === name)

    if (!service) {
      service = new Service(name)
      services.push(service)
    }

    if (service) {
      service.operations.push(operation)
    }

    // 生成Imports
    service.operations
      .flatMap((operation) => operation.imports)
      .forEach((model) => {
        if (service && !service.imports.includes(model)) {
          service.imports.push(model)
        }
      })
  })
}
