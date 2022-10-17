import type { OpenAPIV3 } from 'openapi-types'
import { parseModels } from './parse-models'

export function parseV3(document: OpenAPIV3.Document) {
  const models = parseModels(document)
  return models
}
