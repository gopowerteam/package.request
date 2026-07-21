import type { OpenAPIV3 } from 'openapi-types'
import type { ParseContext, ResolvedSchema } from './resolve-content'
import { OperationParameter } from '../../entities/operation-parameter'
import { parseSchemaType } from './parse-schema-type'
import { ParseMediaError, resolveFromContent } from './resolve-content'

/**
 * 兼容别名:与 ParseContext 等价
 */
export type ParseBodyContext = ParseContext

export function parseParametersBody(
  requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject,
  context: ParseContext,
): OperationParameter {
  const { type, ref, imports, mediaType } = parseBodyType(requestBody, context)

  const parameter = new OperationParameter()

  parameter.name = 'requestBody'
  parameter.in = 'body'
  parameter.type = type
  parameter.ref = ref
  parameter.imports = imports || []
  parameter.mediaType = mediaType

  return parameter
}

function parseBodyType(
  requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject,
  context: ParseContext,
): ResolvedSchema {
  // 引用直接类型转换
  if ('$ref' in requestBody) {
    return parseSchemaType(requestBody)
  }

  if (!requestBody.content) {
    throw new ParseMediaError(context, 'RequestBody', 'requestBody 缺少 content 字段')
  }

  return resolveFromContent(requestBody.content, context, 'RequestBody')
}
