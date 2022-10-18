import type { OpenAPIV3 } from 'openapi-types'
import { Model } from '../../entities/model'
import { parseFields } from './parse-fields'

export function parseModel(name: string, definition: OpenAPIV3.SchemaObject) {
  const model = new Model(name)

  // 生成字段
  model.fields = parseFields(definition)
  model.imports = parseImports(model)

  return model
}

function parseImports(model: Model) {
  return model.fields
    .filter((field) => field.isRef && field.ref)
    .map((field) => field.ref as string)
    .filter((ref) => ref !== model.name)
}
