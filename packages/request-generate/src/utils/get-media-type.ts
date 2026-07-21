import type { SchemaType } from '../types/schema-type'

export type MediaTypeKind
  = | 'json'
    | 'binary'
    | 'multipart'
    | 'urlencoded'
    | 'text'
    | 'unknown'

/**
 * JSON 家族正则,匹配:
 *   - application/json
 *   - application/json; charset=utf-8
 *   - application/vnd.foo+json
 *   - application/problem+json
 */
const JSON_MEDIA_RE = /^application\/(?:[\w.+-]+\+)?json(?:;|$)/i

const TEXT_MEDIA_RE = /^text\//i

/**
 * 已知二进制 media 类型(整体映射为 Blob)
 */
const BINARY_MEDIA_TYPES = new Set([
  'application/octet-stream',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-tar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'audio/mpeg',
  'audio/ogg',
  'video/mp4',
  'video/webm',
])

/**
 * 根据 media-type 字符串判定类别
 */
export function classifyMediaType(mediaType: string): MediaTypeKind {
  if (!mediaType) {
    return 'unknown'
  }
  if (JSON_MEDIA_RE.test(mediaType)) {
    return 'json'
  }
  if (mediaType === 'multipart/form-data') {
    return 'multipart'
  }
  if (mediaType === 'application/x-www-form-urlencoded') {
    return 'urlencoded'
  }
  if (BINARY_MEDIA_TYPES.has(mediaType.toLowerCase())) {
    return 'binary'
  }
  if (TEXT_MEDIA_RE.test(mediaType)) {
    return 'text'
  }
  if (mediaType === '*/*') {
    return 'json'
  }
  return 'unknown'
}

/**
 * media 类别 → TS 类型(浏览器优先:Blob/FormData/URLSearchParams)
 * 非 JSON 类别直接映射,不再解析内部 schema
 */
export const MEDIA_TYPE_TS_MAPPING: Record<MediaTypeKind, SchemaType> = {
  json: { type: 'any', ref: 'any', imports: [] },
  binary: { type: 'Blob', ref: 'Blob', imports: [] },
  multipart: { type: 'FormData', ref: 'FormData', imports: [] },
  urlencoded: { type: 'URLSearchParams', ref: 'URLSearchParams', imports: [] },
  text: { type: 'string', ref: 'string', imports: [] },
  unknown: { type: 'any', ref: 'any', imports: [] },
}
