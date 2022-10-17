import type { OpenAPIV2 } from 'openapi-types'
import { parseModels } from './parse-models'

export function parseV2(document: OpenAPIV2.Document) {
  // 生成models
  const models = parseModels(document)
  return models
}
