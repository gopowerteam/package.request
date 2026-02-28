import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import type { GenerateClient } from '../types/generate-client'
import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'
import process from 'node:process'
import { OpenAPIVersion } from '../config/enum.config'
import { parseV2 } from '../parse/v2'
import { parseV3 } from '../parse/v3'
import { collectResult, outputSummary, startSpinner, stopSpinner } from '../progress'
import { registerHandlebarTemplates } from '../template'
import { getOpenApiDocument } from '../utils/get-openapi-document'
import { getOpenAPIVersion } from '../utils/get-openapi-version'
import { generateServiceOptions } from '../utils/get-services-options'
import { updateOptionsFromLocalConfig } from './write-config'
import { writeModels } from './write-models'
import { writeServices } from './write-services'

type UnkownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

export class Generate {
  public static options: GenerateOptions

  /**
   * 生成入口
   * @param options
   * @returns Promise<void>
   */
  static async startup(options: GenerateOptions) {
    startSpinner()
    // 保存配置
    Generate.options = options
    // 注册Handlebars模板
    registerHandlebarTemplates()
    // 生成服务列表
    let applicationOptions = generateServiceOptions(options)
    applicationOptions = updateOptionsFromLocalConfig(applicationOptions, options.output)

    const applications: { client: GenerateClient, options: GenerateApplicationOptions }[] = []

    for (const applicationOption of applicationOptions) {
      const client = await Generate.generateApplicationClient(applicationOption)
      applications.push({
        client,
        options: applicationOption,
      })
    }

    for (const application of applications) {
      collectResult(
        application.options.name || 'default',
        application.client.models.length,
        application.client.services.length,
      )
      Generate.writeClient(application.client, application.options)
    }

    stopSpinner()
    outputSummary()
  }

  static async getApiDocument(input: string): Promise<UnkownVersionDocument> {
    try {
      // 获取OPENAPI
      const document = await getOpenApiDocument(
        input,
      )

      return document as UnkownVersionDocument
    }
    catch {
      console.error(`请求文件[${input}]失败,请稍后重试.`)
      process.exit(0)
    }
  }

  /**
   * 生成应用
   */
  static async generateApplicationClient(options: GenerateApplicationOptions) {
    // 获取文档
    const document = await Generate.getApiDocument(options.input)
    // 获取版本号
    const version = getOpenAPIVersion(document)
    // 获取转换信息
    const client = Generate.generateClient(document, version)

    return client
  }

  /**
   * 生成对象信息
   * @param document
   * @param version
   * @returns GenerateClient
   */
  static generateClient(
    document: UnkownVersionDocument,
    version: OpenAPIVersion,
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
    options: GenerateApplicationOptions,
  ) {
    // 写入model
    writeModels(client, options)
    // 写入Service
    writeServices(client, options)
  }
}
