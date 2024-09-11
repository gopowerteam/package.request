import type { OpenAPIV3 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { Generate } from '../../generate'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersQuery(
  parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[],
) {
  const excludeParams = Generate.options?.exportServices?.excludeQueryParams

  return parameters.reduce<OperationParameter[]>((r, p) => {
    if (
      !('$ref' in p)
      && p.in === 'query'
      && p.schema
      && !(excludeParams && excludeParams.includes(p.name))
    ) {
      const { type, ref, imports, enums } = parseSchemaType(p.schema)

      const parameter = new OperationParameter()

      parameter.name = p.name
      parameter.description = p.description
      parameter.in = 'query'
      parameter.type = type
      parameter.ref = ref
      parameter.required = p.required
      parameter.imports = imports || []
      parameter.enums = enums

      if (
        p.name.includes('.')
        && !p.name.startsWith('.')
        && !p.name.endsWith('.')
      ) {
        parameter.name = `"${p.name}"`
      }

      r.push(parameter)
    }

    return r
  }, [])
}
