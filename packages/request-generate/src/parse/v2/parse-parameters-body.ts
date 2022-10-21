import type { OpenAPIV2 } from 'openapi-types'
import { OperationParameter } from '../../entities/operation-parameter'
import { parseSchemaType } from './parse-schema-type'

export function parseParametersBody(
  parameters: (OpenAPIV2.ReferenceObject | OpenAPIV2.Parameter)[]
): OperationParameter | undefined {
  const requestBody = parameters.find(
    (parameter) => !('$ref' in parameter) && parameter.in === 'body'
  )

  if (requestBody && 'schema' in requestBody) {
    const { type, ref, imports } = parseSchemaType(requestBody.schema)

    const parameter = new OperationParameter()

    parameter.name = 'requestBody'
    parameter.in = 'body'
    parameter.type = type
    parameter.ref = ref
    parameter.imports = imports || []

    return parameter
  } else {
    return
  }
}
