import type { OpenAPIV2 } from 'openapi-types'
import { parseModels } from './parse-models'
import { parseServices } from './parse-services'

export function parseV2(document: OpenAPIV2.Document) {
  // 转换Model对象
  const models = parseModels(document)
  // 转换Service对象
  const services = parseServices(document)

  return {
    models,
    services,
  }
}
