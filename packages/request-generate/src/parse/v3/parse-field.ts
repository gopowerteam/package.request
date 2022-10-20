import type { OpenAPIV3 } from 'openapi-types'
import { Field } from '../../entities/field'
import { parseSchemaType } from './parse-schema-type'

export function parseField(
  name: string,
  properties: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
  required = false
) {
  // 创建字段
  const field = new Field(name, required)

  // 解析类型
  const { type, ref, imports } = parseSchemaType(properties)

  field.type = type
  field.ref = ref
  field.imports = imports

  if (!('$ref' in properties)) {
    field.enum = properties.enum
    field.description = properties.description
  }

  return field
}
