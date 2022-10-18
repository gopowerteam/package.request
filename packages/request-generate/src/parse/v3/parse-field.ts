import type { OpenAPIV3 } from 'openapi-types'
import { Field } from '../../entities/field'
import { getMappedType } from '../../utils/get-mapped-type'
import { stripNamespace } from './strip-namespace'

/**
 * 转换引用字段
 * @param field
 * @param properties
 */
function parseRefField(field: Field, properties: OpenAPIV3.ReferenceObject) {
  field.isRef = true

  switch (true) {
    case typeof field.ref === 'string':
      field.ref = [field.ref as string, stripNamespace(properties.$ref)]
      break
    case Array.isArray(field.ref): {
      const refs = field.ref as string[]
      refs.push(stripNamespace(properties.$ref))
      break
    }
    default:
      field.ref = stripNamespace(properties.$ref)
  }
}

/**
 * 转换AllOf字段
 */
function parseAllOfField(field: Field, properties: OpenAPIV3.SchemaObject) {
  const [property] = properties.allOf || []

  if (property && '$ref' in property) {
    parseRefField(field, property)
  }
}

/**
 * 转换AllOf字段
 */
function parseAnyOfField(field: Field, properties: OpenAPIV3.SchemaObject) {
  const list = properties.oneOf || properties.anyOf || []

  list.forEach((property) => {
    if (property && '$ref' in property) {
      parseRefField(field, property)
    }
  })
}

/**
 * 转换Array字段
 */
function parseArrayField(
  field: Field,
  properties: OpenAPIV3.ArraySchemaObject
) {
  field.isArray = true

  if ('$ref' in properties.items) {
    parseRefField(field, properties.items)
  } else {
    field.type = properties.items.type || 'any'
  }
}

export function parseField(
  name: string,
  properties: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
  required = false
) {
  const field = new Field(name, required)

  // 转换Ref类型字段
  if ('$ref' in properties) {
    parseRefField(field, properties)
    return field
  }

  // 字段描述
  field.description = properties?.description

  if ('allOf' in properties) {
    parseAllOfField(field, properties)
    return field
  }

  if ('anyOf' in properties || 'oneOf' in properties) {
    parseAnyOfField(field, properties)
    return field
  }

  if ('items' in properties) {
    parseArrayField(field, properties)
    return field
  }

  // 转换默认Field
  field.type = properties.type ? getMappedType(properties.type) : 'any'
  field.enum = properties.enum

  return field
}
