import type { OpenAPIV3 } from 'openapi-types'
import type { Model } from '../../types/model'
// import { parseModel } from './parse-model'
// import { parseType } from './parse-type'

export function parseModels(document: OpenAPIV3.Document) {
  const models: Model[] = []
  if (document.components) {
    for (const definitionName in document.components.schemas) {
      const { schemas } = document.components
      if (definitionName in schemas) {
        const definition = document.components.schemas[definitionName]
        // const model = parseModel(document, definition)
        // models.push(model)
        return definition
      }
    }
  }

  return models
}
