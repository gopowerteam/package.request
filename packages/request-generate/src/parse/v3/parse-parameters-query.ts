import type { OpenAPIV3 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { Generate } from '../../generate'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersQuery(
  parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
) {
  const excludeParams = Generate.options?.exportServices?.excludeQueryParams

  return parameters.reduce<OperationParameter[]>((r, p) => {
    if (
      !('$ref' in p) &&
      p.in === 'query' &&
      p.schema &&
      !(excludeParams && excludeParams.includes(p.name))
    ) {
      const { type, ref, imports } = parseSchemaType(p.schema)

      const parameter = new OperationParameter()

      parameter.name = p.name
      parameter.description = p.description
      parameter.in = 'query'
      parameter.type = type
      parameter.ref = ref
      parameter.imports = imports || []

      r.push(parameter)
    }

    return r
  }, [])
}
