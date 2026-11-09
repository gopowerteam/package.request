import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'

/**
 * 生成全局选项
 */
export interface GenerateOptions {
  // 网关地址
  gateway: string
  // OpenAPI地址
  openapi: string
  // 输出目录
  output: string
  /**
   * 相对路径解析基准(.request 快照/账本、output):
   * 由 loadConfigFile 自动注入为配置文件所在目录;缺省 process.cwd()(CLI 直连参数等场景)
   */
  baseDir?: string
  // 输出Model路径
  exportModels: boolean
  // 开启日志输出
  logger?: boolean
  // 强制清空输出目录(跳过 .generated 标记检查,用于旧项目迁移)
  forceClear?: boolean
  // 输出Model路径
  exportServices?: {
    serviceResolve?: (options: {
      path: string
      method: string
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
      tags: OpenAPIV2.TagObject[]
    }) => string | string[]
    operationResolve?: (options: {
      path: string
      method: string
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
    }) => string
    excludeQueryParams?: string[]
    responseType?: 'promise' | 'observable'
  }
  // 多应用列表
  applications?: Record<string, ApplicationConfig>
  // 追加service
  appendService?: boolean
}

export type ApplicationConfig
  = | {
    key: string
    openapi: string
  }
  | string

/**
 * 生成应用选项
 */
export type GenerateApplicationOptions = Pick<
  GenerateOptions,
  'exportModels' | 'output' | 'forceClear' | 'baseDir'
> & {
  // 服务名称
  name?: string
  // 应用名称
  application?: string
  // OPENAPI地址
  input: string
}
