import type { OpenAPIV3 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersPath(
  parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[],
) {
  return parameters.reduce<OperationParameter[]>((r, p) => {
    if (!('$ref' in p) && p.in === 'path' && p.schema) {
      const { type, ref, imports, enums } = parseSchemaType(p.schema)

      const parameter = new OperationParameter()

      parameter.name = p.name
      parameter.description = p.description
      parameter.in = 'path'
      parameter.type = type
      parameter.ref = ref
      parameter.imports = imports || []
      parameter.enums = enums

      r.push(parameter)
    }

    return r
  }, [])
}
