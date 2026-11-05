import type { OpenAPIV3 } from 'openapi-types'
import { Field } from '../../entities/field'
import { parseSchemaType } from './parse-schema-type'

export function parseField(
  name: string,
  properties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
  required = false,
) {
  // 创建字段
  const field = new Field(name, required)

  // 解析类型
  const { type, ref, imports, enums } = parseSchemaType(properties)

  field.type = type
  field.ref = ref
  field.imports = imports
  field.enums = enums

  // boolean schema(3.1)无 description
  if (typeof properties !== 'boolean' && !('$ref' in properties)) {
    field.description = properties.description
  }

  return field
}
