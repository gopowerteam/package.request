import type { OpenAPIV2 } from 'openapi-types'
import type { GenerateClient } from '../../types/generate-client'
import { parseModels } from './parse-models'

export function parseV2(document: OpenAPIV2.Document): GenerateClient {
  // 生成models
  const models = parseModels(document)

  return {
    models
  }
}
