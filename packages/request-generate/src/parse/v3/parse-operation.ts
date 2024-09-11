import type { OpenAPIV3 } from 'openapi-types'
import { Operation } from '../../entities/operation'
import { getOperationName } from '../../utils/get-operation-name'
import { parseParametersBody } from './parse-parameters-body'
import { parseParametersPath } from './parse-parameters-path'
import { parseParametersQuery } from './parse-parameters-query'
import { parseSchemaType } from './parse-schema-type'

export function parseOperation(
  path: string,
  method: string,
  operationObject: OpenAPIV3.OperationObject,
) {
  const name = getOperationName(path, method, operationObject)

  const operation = new Operation(name, method, path)

  // Operation注释
  operation.description = operationObject.summary

  if (operationObject.requestBody) {
    operation.parametersBody = parseParametersBody(operationObject.requestBody)
  }

  if (operationObject.parameters) {
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

  operation.responseRef = responseSchema?.ref || responseSchema?.type || 'void'

  return operation
}

function parseResponseType(responses: OpenAPIV3.ResponsesObject) {
  const SUCCESS_STATUS_CODE = '200'
  const response = responses?.[SUCCESS_STATUS_CODE]

  const medias = ['*/*', 'application/json']

  // 引用直接类型转换
  if (response && '$ref' in response) {
    return parseSchemaType(responses)
  }

  if (
    response
    && 'content' in response
    && medias.some(media => !!response?.content?.[media]?.schema)
  ) {
    // 查找media类型
    const mediaType = medias.find(
      media => !!response?.content?.[media]?.schema,
    )

    // 获取media schema
    const schema = response?.content?.[mediaType!]?.schema

    return parseSchemaType(schema!)
  }

  return {
    type: 'void',
    ref: 'void',
    imports: [],
  }
}
