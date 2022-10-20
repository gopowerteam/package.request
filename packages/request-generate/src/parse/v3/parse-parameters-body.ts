import type { OpenAPIV3 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersBody(
  requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): OperationParameter {
  const { type, ref, imports } = parseBodyType(requestBody)

  const parameter = new OperationParameter()

  parameter.name = 'requestBody'
  parameter.in = 'body'
  parameter.type = type
  parameter.ref = ref
  parameter.imports = imports || []

  return parameter
}

function parseBodyType(
  requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
) {
  // 引用直接类型转换
  if ('$ref' in requestBody) {
    return parseSchemaType(requestBody)
  }

  if (
    'content' in requestBody &&
    requestBody?.content['application/json']?.schema
  ) {
    const schema = requestBody?.content['application/json']?.schema

    return parseSchemaType(schema)
  }

  throw new Error('无法解析RequestBody Schema')
}
