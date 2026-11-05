import type { OpenAPIV3 } from 'openapi-types'
import type { SchemaType } from '../../types/schema-type'
import { getBuiltInType } from '../../utils/get-built-in-type'
import { getCamelName } from '../../utils/get-camel-name'
import { getMappedType } from '../../utils/get-mapped-type'
import { getSchemaTypeInfo } from '../../utils/get-schema-type-info'
import { stripNamespace } from './strip-namespace'

/** const(3.1)仅原始类型可安全映射为枚举字面量,其余降级 */
const PRIMITIVE_CONST_TYPES = new Set(['string', 'number', 'boolean'])

/**
 * 为类型串附加可空标记(3.1 type 数组含 'null' / 3.0 nullable: true)
 */
function withNullable(type: string, isNullable: boolean): string {
  if (!isNullable || type.includes('null')) {
    return type
  }
  return `${type} | null`
}

/**
 * 解析 const / enum 为枚举字面量数组。
 * - enum:各值 String 化(与既有渲染约定一致,引号转义不做)
 * - const(3.1,≈ 单值枚举):仅 string / number / boolean 三类映射,其余忽略
 */
function resolveEnums(schema: { enum?: unknown[], const?: unknown }): string[] | undefined {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum.map(v => String(v))
  }

  const constValue = schema.const
  if (
    constValue !== undefined
    && constValue !== null
    && PRIMITIVE_CONST_TYPES.has(typeof constValue)
  ) {
    return [String(constValue)]
  }

  return undefined
}

/**
 * 解析 Schema 为生成用类型描述。
 *
 * 同时兼容 OpenAPI 3.0 与 3.1(JSON Schema 2020-12):
 * - boolean schema:true → any,false → never
 * - 3.1 type 数组(type: [string, 'null'])与 3.0 nullable: true 统一归一,
 *   可空标记附加到最终 type / ref(如 `User[] | null`)
 * - type 数组多类型 → 联合类型(string | number)
 * - const ≈ 单值枚举,复用既有枚举字面量渲染
 * - 引用含 $defs 段(JSON Schema 内嵌定义)→ 降级 any,不生成悬空 import
 * - prefixItems(3.1 tuple)暂不支持,降级 any[](P2)
 */
export function parseSchemaType(
  schema: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): SchemaType {
  // Boolean Schema(3.1)
  if (typeof schema === 'boolean') {
    return { type: schema ? 'any' : 'never' }
  }

  const { types, isNullable } = getSchemaTypeInfo(schema)

  // ReferenceObject
  if ('$ref' in schema) {
    // 嵌套 $defs(JSON Schema 内嵌定义)不会被生成对应模型 → 降级 any,避免悬空 import
    if (schema.$ref.includes('$defs')) {
      return { type: 'any' }
    }

    const ref = getCamelName(stripNamespace(schema.$ref))

    return {
      type: 'any',
      ref: withNullable(ref, isNullable),
      imports: [ref],
    }
  }

  // 标量 / 枚举 / 多类型联合(非数组、非组合)
  if (
    !types.includes('array')
    && !schema.allOf
    && !schema.anyOf
    && !schema.oneOf
  ) {
    // 3.1 type 数组多类型 → 联合(string | number)
    if (types.length > 1) {
      return {
        type: withNullable(types.map(t => getMappedType(t)).join(' | '), isNullable),
      }
    }

    const mapped = getMappedType(types[0] ?? 'any')
    const enums = resolveEnums(schema)

    // nullable + enum → 枚举字面量折叠进 type 渲染路径('a' | 'b' | null)
    if (enums && isNullable) {
      return {
        type: withNullable(enums.map(e => `'${e}'`).join(' | '), true),
      }
    }

    if (enums) {
      return { type: mapped, enums }
    }

    return { type: withNullable(mapped, isNullable) }
  }

  // Array(3.0 type: 'array' 或 3.1 type: ['array', ...])
  if (types.includes('array')) {
    const arraySchema = schema as OpenAPIV3.ArraySchemaObject & {
      prefixItems?: unknown
    }

    // prefixItems(3.1 tuple)暂不支持 → 降级 any[](P2)
    if (!arraySchema.items && arraySchema.prefixItems) {
      return { type: withNullable('any[]', isNullable) }
    }

    // 数组元素为 $ref
    if (arraySchema.items && '$ref' in arraySchema.items) {
      const items = arraySchema.items

      // 元素引用嵌套 $defs → 整体降级 any[](避免悬空 import)
      if (items.$ref.includes('$defs')) {
        return { type: withNullable('any[]', isNullable) }
      }

      const ref = getCamelName(stripNamespace(items.$ref))
      const type = getBuiltInType(ref)

      return {
        type: 'any[]',
        ref: withNullable(`${type ?? ref}[]`, isNullable),
        imports: type ? undefined : [ref],
      }
    }

    // 数组元素为内联 schema(3.1 允许元素 type 为数组)
    if (arraySchema.items) {
      const itemInfo = getSchemaTypeInfo(arraySchema.items)
      const itemType = itemInfo.types.length > 1
        ? itemInfo.types.map(t => getMappedType(t)).join(' | ')
        : getMappedType(itemInfo.types[0] ?? 'any')
      // 元素自身可空 → 括号包裹,保证 (string | null)[] 优先级正确
      const item
        = itemInfo.isNullable && itemType !== 'any' && itemType !== 'any[]'
          ? `(${itemType} | null)`
          : itemType

      return {
        type: withNullable(`${item}[]`, isNullable),
      }
    }

    // 声明 array 但缺少 items / prefixItems → 落到末尾抛错(保持旧行为)
  }

  // AllOf|AnyOf|OneOf
  if (schema.allOf || schema.anyOf || schema.oneOf) {
    const ofSchema = schema.allOf || schema.anyOf || schema.oneOf

    const ofSchemaArray = ofSchema?.map(s => parseSchemaType(s))

    if (ofSchemaArray) {
      const hasRef = ofSchemaArray.some(s => s.ref)

      return {
        type: hasRef
          ? 'any'
          : withNullable(ofSchemaArray.map(s => s.type).join('|'), isNullable),
        ref: hasRef
          ? withNullable(
              ofSchemaArray
                .map(s => (s.ref && getCamelName(s.ref)) || s.type)
                .join('|'),
              isNullable,
            )
          : undefined,
        imports: hasRef
          ? ofSchemaArray.reduce<string[]>(
              (r, s) => (
              // eslint-disable-next-line no-sequences
                s.ref && !r.includes(s.ref) && r.push(getCamelName(s.ref)), r
              ),
              [],
            )
          : undefined,
      }
    }
  }

  throw new Error(`无法解析相应的schema: ${JSON.stringify(schema).slice(0, 200)}`)
}
