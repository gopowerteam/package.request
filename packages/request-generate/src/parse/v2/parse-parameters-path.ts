import type { OpenAPIV2 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersPath(
  parameters: (OpenAPIV2.ReferenceObject | OpenAPIV2.ParameterObject)[]
) {
  return parameters.reduce<OperationParameter[]>((r, p) => {
    if (!('$ref' in p) && p.in === 'path') {
      const { type, ref, imports, enums } = parseSchemaType(
        p as OpenAPIV2.SchemaObject
      )

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
