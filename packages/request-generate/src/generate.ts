import type {
  GenerateApplicationOptions,
  GenerateOptions
} from './types/generate-options'
import { getOpenApiDocument } from './utils/get-openapi-document'
import { getOpenAPIVersion } from './utils/get-openapi-version'
import { generateServiceOptions } from './utils/get-services-options'
import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'
import { OpenAPIVersion } from './config/enum.config'
import { parseV2 } from './parse/v2'
import { parseV3 } from './parse/v3'

type UnkownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

/**
 * 生成入口
 * @param options
 * @returns
 */
export function generate(options: GenerateOptions) {
  // 生成服务列表
  return Promise.all(generateServiceOptions(options).map(generateApplication))
}

/**
 * 生成应用
 */
async function generateApplication(options: GenerateApplicationOptions) {
  // 获取OPENAPI
  const document = (await getOpenApiDocument(
    options.input
  )) as UnkownVersionDocument
  // 获取版本号
  const version = getOpenAPIVersion(document)
  // 获取转换信息
  const client = generateClient(document, version)

  return client
}

/**
 * 生成对象信息
 * @param document
 * @param version
 * @returns
 */
function generateClient(
  document: UnkownVersionDocument,
  version: OpenAPIVersion
) {
  switch (version) {
    case OpenAPIVersion.V2:
      return parseV2(document)
    case OpenAPIVersion.V3:
      return parseV3(document)
  }
}
