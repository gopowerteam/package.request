import type {
  GenerateApplicationOptions,
  GenerateOptions
} from '../types/generate-options'
import { getOpenApiDocument } from '../utils/get-openapi-document'
import { getOpenAPIVersion } from '../utils/get-openapi-version'
import { generateServiceOptions } from '../utils/get-services-options'
import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'
import { OpenAPIVersion } from '../config/enum.config'
import { parseV2 } from '../parse/v2'
import { parseV3 } from '../parse/v3'
import type { GenerateClient } from '../types/generate-client'
import { writeModels } from './write-models'
import { registerHandlebarTemplates } from '../utils/handlebar-templates'

type UnkownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

export class Generate {
  public static options: GenerateOptions

  /**
   * 生成入口
   * @param options
   * @returns
   */
  static startup(options: GenerateOptions) {
    // 保存配置
    Generate.options = options
    // 注册Handlebars模板
    registerHandlebarTemplates()
    // 生成服务列表
    const applicationOptions = generateServiceOptions(options)
    // 生成应用
    return Promise.all(
      applicationOptions.map((applicationOption) =>
        Generate.generateApplication(applicationOption)
      )
    )
  }

  /**
   * 生成应用
   */
  static async generateApplication(options: GenerateApplicationOptions) {
    // 获取OPENAPI
    const document = (await getOpenApiDocument(
      options.input
    )) as UnkownVersionDocument
    // 获取版本号
    const version = getOpenAPIVersion(document)
    // 获取转换信息
    const client = Generate.generateClient(document, version)
    // 写入文件
    Generate.writeClient(client, options)
  }

  /**
   * 生成对象信息
   * @param document
   * @param version
   * @returns
   */
  static generateClient(
    document: UnkownVersionDocument,
    version: OpenAPIVersion
  ): GenerateClient {
    switch (version) {
      case OpenAPIVersion.V2:
        return parseV2(document)
      case OpenAPIVersion.V3:
        return parseV3(document)
    }
  }

  /**
   * 写入Client对象
   * @param client
   * @param options
   */
  static writeClient(
    client: GenerateClient,
    options: GenerateApplicationOptions
  ) {
    // 写入model
    writeModels(client, options)

    // 写入Service
    // writeService()
  }
}

export const generate = Generate.startup
