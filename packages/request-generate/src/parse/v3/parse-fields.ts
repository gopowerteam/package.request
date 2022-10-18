import type { OpenAPIV3 } from 'openapi-types'
import { parseField } from './parse-field'

export function parseFields(schema: OpenAPIV3.SchemaObject) {
  return Object.entries(schema.properties || {}).map(([name, property]) =>
    parseField(name, property, schema.required?.includes(name))
  )
}
