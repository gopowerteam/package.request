import type { OpenAPIV3 } from 'openapi-types'
import type { ParseContext } from './parse-content'
import { Operation } from '../../entities/operation'
import { getOperationName } from '../../utils/get-operation-name'
import { resolveFromContent } from './parse-content'
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

  const context: ParseContext = {
    path,
    method,
    operationId: operationObject.operationId,
  }

  if (operationObject.requestBody) {
    operation.parametersBody = parseParametersBody(
      operationObject.requestBody,
      context,
    )
  }

  if (operationObject.parameters) {
    operation.parametersPath = parseParametersPath(operationObject.parameters)
    operation.parametersQuery = parseParametersQuery(operationObject.parameters)
  }

  // 解析返回类型
  const responseSchema = parseResponseType(operationObject.responses, context)

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

function parseResponseType(
  responses: OpenAPIV3.ResponsesObject,
  context: ParseContext,
) {
  const SUCCESS_STATUS_CODE = '200'
  const response = responses?.[SUCCESS_STATUS_CODE]

  // 无 200 响应 → void
  if (!response) {
    return {
      type: 'void',
      ref: 'void',
      imports: [],
    }
  }

  // $ref 响应(与 V2 行为对齐,存在已知限制 — 完整修复需 swagger-parser.dereference)
  if ('$ref' in response) {
    return parseSchemaType(response)
  }

  // 无 content(如 204 No Content)→ void
  if (!response.content || Object.keys(response.content).length === 0) {
    return {
      type: 'void',
      ref: 'void',
      imports: [],
    }
  }

  // 共享解析器:支持 application/json 家族、multipart、binary、text 等
  return resolveFromContent(response.content, context, 'Response')
}
