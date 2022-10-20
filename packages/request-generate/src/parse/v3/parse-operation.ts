import type { OpenAPIV3 } from 'openapi-types'
import { Operation } from '../../entities/operation'
import { getOperationName } from '../../utils/get-operation-name'
import { parseParametersBody } from './parse-parameters-body'
import { parseParametersPath } from './parse-parameters-path'
import { parseParametersQuery } from './parse-parameters-query'

export function parseOperation(
  path: string,
  method: string,
  operationObject: OpenAPIV3.OperationObject
) {
  const name = getOperationName(path, method, operationObject)

  const operation = new Operation(name, method)

  if (operationObject.requestBody) {
    operation.parametersBody = parseParametersBody(operationObject.requestBody)
  }

  if (operationObject.parameters) {
    operation.parametersPath = parseParametersPath(operationObject.parameters)
    operation.parametersQuery = parseParametersQuery(operationObject.parameters)
  }

  operation.imports = Array.from(
    new Set([
      ...(operation.parametersBody?.imports || []),
      ...(operation.parametersPath.flatMap((p) => p.imports) || []),
      ...(operation.parametersQuery.flatMap((p) => p.imports) || [])
    ])
  )

  return operation
}
