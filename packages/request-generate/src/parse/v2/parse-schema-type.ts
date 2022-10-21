import type { OpenAPIV2 } from 'openapi-types'
import type { SchemaType } from '../../types/schema-type'
import { getCamelName } from '../../utils/get-camel-name'
import { getMappedType } from '../../utils/get-mapped-type'
import { stripNamespace } from './strip-namespace'

export function parseSchemaType(
  schema: OpenAPIV2.ReferenceObject | OpenAPIV2.SchemaObject
): SchemaType {
  // ReferenceObject类型
  if ('$ref' in schema && schema.$ref) {
    // 获取引用类型
    const ref = getCamelName(stripNamespace(schema.$ref))

    return {
      type: 'any',
      ref,
      imports: [ref]
    }
  }

  // NonArraySchemaObjectType类型
  if (
    !('$ref' in schema) &&
    schema.type !== 'array' &&
    typeof schema.type === 'string' &&
    !schema.allOf &&
    !schema.anyOf &&
    !schema.oneOf
  ) {
    return {
      type: getMappedType(schema.type || 'any'),
      ref: undefined,
      enums: schema.enum
    }
  }

  // ArrayReferenceObject类型
  if (
    !('$ref' in schema) &&
    schema.type === 'array' &&
    schema.items &&
    '$ref' in schema.items &&
    schema.items.$ref
  ) {
    // 获取引用类型
    const ref = getCamelName(stripNamespace(schema.items.$ref))

    return {
      type: 'any[]',
      ref: `${ref}[]`,
      imports: [ref]
    }
  }

  // ArraySchemaObject类型
  if (
    !('$ref' in schema) &&
    schema.type === 'array' &&
    schema.items &&
    !('$ref' in schema.items)
  ) {
    return {
      type: `${getMappedType(schema.items.type)}[]`,
      ref: undefined
    }
  }

  // TODO: 多类型处理

  throw new Error('无法解析相应的schema')
}
