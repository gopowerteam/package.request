import type { OpenAPIV2 } from 'openapi-types'
import { Operation } from '../../entities/operation'
import { getOperationName } from '../../utils/get-operation-name'
import { parseParametersBody } from './parse-parameters-body'
import { parseParametersPath } from './parse-parameters-path'
import { parseParametersQuery } from './parse-parameters-query'
import { parseSchemaType } from './parse-schema-type'

export function parseOperation(
  path: string,
  method: string,
  operationObject: OpenAPIV2.OperationObject,
) {
  const name = getOperationName(path, method, operationObject)

  const operation = new Operation(name, method, path)

  // Operation注释
  operation.description = operationObject.summary || operation.description

  if (operationObject.parameters) {
    operation.parametersBody = parseParametersBody(operationObject.parameters)
    operation.parametersPath = parseParametersPath(operationObject.parameters)
    operation.parametersQuery = parseParametersQuery(operationObject.parameters)
  }

  // 解析返回类型
  const responseSchema = parseResponseType(operationObject.responses)

  operation.imports = Array.from(
    new Set([
      ...(operation.parametersBody?.imports || []),
      ...(operation.parametersPath.flatMap(p => p.imports) || []),
      ...(operation.parametersQuery.flatMap(p => p.imports) || []),
      ...(responseSchema?.imports || []),
    ]),
  )

  operation.responseRef = responseSchema?.ref || 'void'

  return operation
}

function parseResponseType(responses: OpenAPIV2.ResponsesObject) {
  const SUCCESS_STATUS_CODE = '200'
  const response = responses?.[SUCCESS_STATUS_CODE]

  // 引用直接类型转换
  if (response && '$ref' in response) {
    return parseSchemaType(response)
  }

  if (response && 'schema' in response && response?.schema) {
    return parseSchemaType(response?.schema)
  }

  return {
    type: 'void',
    ref: 'void',
    imports: [],
  }
}
