import type { OpenAPIV2 } from 'openapi-types'
import { Model } from '../../entities/model'
import { parseFields } from './parse-fields'

export function parseModel(name: string, definition: OpenAPIV2.SchemaObject) {
  const model = new Model(name)

  // 生成字段
  model.fields = parseFields(definition)
  // 导入模型
  const imports = model.fields
    .filter((field) => field.imports)
    .reduce<string[]>((r, m) => [...r, ...(m.imports || [])], [])
    .filter((m) => m !== name)

  model.imports = Array.from(new Set(imports))

  return model
}
