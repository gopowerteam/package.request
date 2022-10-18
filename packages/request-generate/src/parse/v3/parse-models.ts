import type { OpenAPIV3 } from 'openapi-types'
import type { Model } from '../../entities/model'
import { parseModel } from './parse-model'
// import { parseType } from './parse-type'

export function parseModels(document: OpenAPIV3.Document) {
  const models: Model[] = []

  if (document.components) {
    for (const definitionName in document.components.schemas) {
      const { schemas } = document.components
      // 遍历自身对象
      if (Object.getOwnPropertyNames(schemas).includes(definitionName)) {
        const definition = document.components.schemas[
          definitionName
        ] as OpenAPIV3.SchemaObject
        // 生成model对象
        const model = parseModel(definitionName, definition)

        models.push(model)
      }
    }
  }

  return models
}
