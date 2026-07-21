import type { OpenAPIV2 } from 'openapi-types'
import type { SchemaType } from '../../types/schema-type'
import { OperationParameter } from '../../entities/operation-parameter'
import {
  classifyMediaType,
  MEDIA_TYPE_TS_MAPPING,
} from '../../utils/get-media-type'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersBody(
  parameters: (OpenAPIV2.ReferenceObject | OpenAPIV2.Parameter)[],
  consumes: string[] = [],
): OperationParameter | undefined {
  // 优先级 1:body 参数(模式 A,典型 JSON body 或 body+consumes)
  const requestBody = parameters.find(
    parameter => !('$ref' in parameter) && parameter.in === 'body',
  )

  if (requestBody && 'schema' in requestBody) {
    const { schemaType, mediaType } = resolveBodyType(
      requestBody.schema,
      consumes,
    )

    const parameter = new OperationParameter()

    parameter.name = 'requestBody'
    parameter.in = 'body'
    parameter.type = schemaType.type
    parameter.ref = schemaType.ref
    parameter.imports = schemaType.imports || []
    parameter.mediaType = mediaType

    return parameter
  }

  // 优先级 2:formData 参数聚合(模式 B,V2 文件上传主流写法)
  // 仅当 consumes 显式声明 multipart/form-data 时才聚合,否则静默丢弃(决策 4-A)
  if (consumes.includes('multipart/form-data')) {
    const hasFormData = parameters.some(
      parameter => !('$ref' in parameter) && parameter.in === 'formData',
    )
    if (hasFormData) {
      const parameter = new OperationParameter()
      parameter.name = 'requestBody'
      parameter.in = 'body'
      parameter.type = 'FormData'
      parameter.ref = 'FormData'
      parameter.imports = []
      parameter.mediaType = 'multipart/form-data'
      return parameter
    }
  }

  return undefined
}

/**
 * 按 consumes 解析 body 类型
 * 决策 5-A:JSON 家族优先于非 JSON(与 V3 resolveFromContent 行为一致)
 *
 * 优先级:
 *   1. consumes 含 JSON 家族 → 走 schema 派生,不写 mediaType(走 axios 实例默认)
 *   2. consumes 含已知非 JSON media(multipart/binary/urlencoded/text)→ 整体类型映射 + mediaType
 *   3. 其他情况(空、未知 media)→ 兜底走 schema 派生
 */
function resolveBodyType(
  schema: OpenAPIV2.Schema,
  consumes: string[],
): { schemaType: SchemaType, mediaType?: string } {
  // 1. JSON 家族优先
  if (consumes.some(mt => classifyMediaType(mt) === 'json')) {
    return { schemaType: parseSchemaType(schema) }
  }

  // 2. 找第一个已知非 JSON 媒体(跳过 unknown)
  const matched = consumes.find((mt) => {
    const kind = classifyMediaType(mt)
    return kind !== 'json' && kind !== 'unknown'
  })
  if (matched) {
    const kind = classifyMediaType(matched)
    return {
      schemaType: { ...MEDIA_TYPE_TS_MAPPING[kind] },
      mediaType: matched,
    }
  }

  // 3. 兜底:schema 派生
  return { schemaType: parseSchemaType(schema) }
}
