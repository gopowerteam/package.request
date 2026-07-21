import type { OpenAPIV3 } from 'openapi-types'
import type { SchemaType } from '../../types/schema-type'
import { classifyMediaType, MEDIA_TYPE_TS_MAPPING } from '../../utils/get-media-type'
import { parseSchemaType } from './parse-schema-type'

/**
 * OpenAPI V3 的 content map 类型
 * (openapi-types 未单独导出 ContentObject,通过类型查询获取)
 */
export type ContentObject = OpenAPIV3.RequestBodyObject['content']

/**
 * 解析上下文,用于错误信息定位
 */
export interface ParseContext {
  path: string
  method: string
  operationId?: string
}

/**
 * 扩展 SchemaType,附加选中的 media-type 字符串
 * - mediaType 仅在选中"已知非 JSON 家族"媒体时写入(multipart/binary/urlencoded/text)
 * - JSON 家族 / 未知 media 兜底 → mediaType 为 undefined
 */
export type ResolvedSchema = SchemaType & { mediaType?: string }

/**
 * 按优先级解析 content map(RequestBody 与 Response 共用):
 *   1. JSON 家族(含通配符) 且有 schema  → parseSchemaType
 *   2. 已知非 JSON media(multipart/binary/urlencoded/text)→ 整体类型映射 + mediaType
 *   3. 未知 media 且有 schema              → parseSchemaType 兜底
 *   4. 无任何 schema                       → 整体类型映射(基于第一个 media)
 *
 * @param content OpenAPI V3 的 content map
 * @param context 解析上下文(用于错误信息)
 * @param label 错误信息标签,如 'RequestBody' / 'Response'
 */
export function resolveFromContent(
  content: ContentObject,
  context: ParseContext,
  label: string,
): ResolvedSchema {
  const entries = Object.entries(content)

  if (entries.length === 0) {
    throw new ParseMediaError(context, label, `${label}.content 为空对象`)
  }

  // 1. JSON 家族 + 通配符 优先,且需有 schema → 不写 mediaType(走 axios 实例默认)
  const jsonEntry = entries.find(
    ([mt, m]) => classifyMediaType(mt) === 'json' && m?.schema,
  )
  if (jsonEntry) {
    return parseSchemaType(jsonEntry[1]!.schema!)
  }

  // 2. 已知非 JSON media(multipart/binary/urlencoded/text)→ 整体类型映射 + 附带 mediaType
  const typedEntry = entries.find(([mt]) => {
    const kind = classifyMediaType(mt)
    return kind !== 'json' && kind !== 'unknown'
  })
  if (typedEntry) {
    const [mediaType, kind] = [typedEntry[0], classifyMediaType(typedEntry[0])]
    return { ...MEDIA_TYPE_TS_MAPPING[kind], mediaType }
  }

  // 3. 未知 media 且有 schema → 兜底用 schema(不写 mediaType)
  const unknownWithSchema = entries.find(([, m]) => m?.schema)
  if (unknownWithSchema) {
    return parseSchemaType(unknownWithSchema[1]!.schema!)
  }

  // 4. 实在没 schema,按第一个 media 的类别兜底(不写 mediaType)
  const [fallbackMediaType] = entries[0]
  const fallbackKind = classifyMediaType(fallbackMediaType)
  return { ...MEDIA_TYPE_TS_MAPPING[fallbackKind] }
}

/**
 * Media 解析错误(含 path/method/operationId 上下文)
 */
export class ParseMediaError extends Error {
  constructor(
    { path, method, operationId }: ParseContext,
    label: string,
    detail: string,
  ) {
    const opLabel = operationId ? ` "${operationId}"` : ''
    super(
      `[V3 ${label} 解析失败] ${method.toUpperCase()} ${path}${opLabel}: ${detail}`,
    )
    this.name = 'ParseMediaError'
  }
}
