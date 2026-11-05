import type { OpenAPIV3 } from 'openapi-types'

/**
 * OpenAPI Schema 类型归一化信息
 * (统一 3.0 与 3.1 两种形态的类型声明,供 parseSchemaType 消费)
 */
export interface SchemaTypeInfo {
  /** 归一后的类型列表(已剔除 'null';缺省 type 归一为空数组) */
  types: string[]
  /** 是否可空:3.1 type 数组含 'null',或 3.0 nullable: true */
  isNullable: boolean
}

/**
 * 归一 3.0 / 3.1 两种形态的 Schema 类型声明:
 * - 3.0: `type: string` + `nullable: true`
 * - 3.1 (JSON Schema 2020-12): `type: string | (string | 'null')[]`
 *   (nullable 关键字已移除,由 type 数组表达)
 * - boolean schema(3.1 允许):true → ['any'],false → ['never']
 */
export function getSchemaTypeInfo(
  schema: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): SchemaTypeInfo {
  if (typeof schema === 'boolean') {
    return { types: [schema ? 'any' : 'never'], isNullable: false }
  }

  // 引用对象无自身类型信息(可空性由 $ref 目标决定,调用方单独处理)
  if ('$ref' in schema) {
    return { types: [], isNullable: false }
  }

  const rawTypes: string[] = Array.isArray(schema.type)
    ? schema.type.map(t => String(t))
    : schema.type
      ? [schema.type]
      : []

  const isNullable
    = rawTypes.includes('null')
      || (schema as { nullable?: unknown }).nullable === true

  const types = rawTypes.filter(t => t !== 'null')

  // 仅声明 null 的极端形态(type: ['null'])→ 'null' 作为唯一类型,不再二次附加
  if (types.length === 0 && isNullable) {
    return { types: ['null'], isNullable: false }
  }

  return { types, isNullable }
}
