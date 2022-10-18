import type { OpenAPIV3 } from 'openapi-types'
import { parseModels } from './parse-models'

export function parseV3(document: OpenAPIV3.Document) {
  // 转换Model对象
  const models = parseModels(document)

  return {
    models
  }
}
