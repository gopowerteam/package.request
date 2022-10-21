import type { OpenAPIV2 } from 'openapi-types'
import type { Model } from '../../entities/model'
import { getCamelName } from '../../utils/get-camel-name'
import { parseModel } from './parse-model'

export function parseModels(document: OpenAPIV2.Document) {
  const models: Model[] = []

  if (document.definitions) {
    for (const definitionName in document.definitions) {
      // 遍历自身对象
      if (
        Object.getOwnPropertyNames(document.definitions).includes(
          definitionName
        )
      ) {
        const definition = document.definitions[
          definitionName
        ] as OpenAPIV2.SchemaObject
        // 生成model对象
        const model = parseModel(getCamelName(definitionName), definition)

        models.push(model)
      }
    }
  }

  return models
}
