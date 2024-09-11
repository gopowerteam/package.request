import type { OpenAPIV2 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { Generate } from '../../generate'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersQuery(
  parameters: (OpenAPIV2.ReferenceObject | OpenAPIV2.ParameterObject)[],
) {
  const excludeParams = Generate.options?.exportServices?.excludeQueryParams

  return parameters.reduce<OperationParameter[]>((r, p) => {
    if (
      !('$ref' in p)
      && p.in === 'query'
      && !(excludeParams && excludeParams.includes(p.name.split('.')[0]))
    ) {
      const { type, ref, imports, enums } = parseSchemaType(
        p as OpenAPIV2.SchemaObject,
      )

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

      // if (
      //   p.name.includes('.') &&
      //   !p.name.startsWith('.') &&
      //   !p.name.endsWith('.')
      // ) {
      //   const [name, subName] = p.name.split('.')

      //   parameter.name = name
      //   parameter.ref = `{ ${subName}${parameter.required ? '?' : ''}: ${
      //     ref || 'any'
      //   } }`
      // }

      r.push(parameter)
    }

    return r
  }, [])
}
