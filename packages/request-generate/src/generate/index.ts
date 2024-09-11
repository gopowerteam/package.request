import process from 'node:process'
import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { OpenAPIVersion } from '../config/enum.config'
import { parseV2 } from '../parse/v2'
import { parseV3 } from '../parse/v3'
import { createProgress, startProgress } from '../progress'
import { registerHandlebarTemplates } from '../template'
import { getOpenApiDocument } from '../utils/get-openapi-document'
import { getOpenAPIVersion } from '../utils/get-openapi-version'
import { generateServiceOptions } from '../utils/get-services-options'
import { writeModels } from './write-models'
import { writeServices } from './write-services'
import type { GenerateClient } from '../types/generate-client'
import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'

type UnkownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

export class Generate {
  public static options: GenerateOptions

  /**
   * 生成入口
   * @param options
   * @returns Promise<void>
   */
  static async startup(options: GenerateOptions) {
    // 保存配置
    Generate.options = options
    // 注册Handlebars模板
    registerHandlebarTemplates()
    // 生成服务列表
    const applicationOptions = generateServiceOptions(options)
    const applications: { client: GenerateClient, options: GenerateApplicationOptions }[] = []

    for (const applicationOption of applicationOptions) {
      const client = await Generate.generateApplicationClient(applicationOption)
      applications.push({
        client,
        options: applicationOption,
      })
    }

    applications.forEach((application) => {
      createProgress(application.options.name || 'default')
      Generate.writeClient(application.client, application.options)
    })
  }

  static async getApiDocument(url: string, retry: number = 0): Promise<UnkownVersionDocument> {
    if (retry >= 3) {
      console.error(`请求[${url}]失败,请稍后重试.`)
      process.exit(0)
    }

    try {
      // 获取OPENAPI
      return (await getOpenApiDocument(
        url,
      )) as UnkownVersionDocument
    }
    catch {
      return Generate.getApiDocument(url, retry + 1)
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
    startProgress(options.name || 'default', {
      models: client.models.length,
      services: client.services.length,
    })
    // 写入model
    writeModels(client, options)
    // 写入Service
    writeServices(client, options)
  }
}
