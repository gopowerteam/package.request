import type { OpenAPIV3 } from 'openapi-types'
import { parseModels } from './parse-models'
import { parseServices } from './parse-services'

export function parseV3(document: OpenAPIV3.Document) {
  // 转换Model对象
  const models = parseModels(document)
  parseServices(document)

  return {
    models,
    services: []
  }
}
