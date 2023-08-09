import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'

/**
 * 生成全局选项
 */
export type GenerateOptions = {
  // 网关地址
  gateway: string
  // OpenAPI地址
  openapi: string
  // 输出目录
  output: string
  // 输出Model路径
  exportModels: boolean
  // 开启日志输出
  logger?: boolean
  // 输出Model路径
  exportServices?: {
    serviceResolve?: (options: {
      path: string
      method: string
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
      tags: OpenAPIV2.TagObject[]
    }) => string
    operationResolve?: (options: {
      path: string
      method: string
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
    }) => string
    excludeQueryParams?: string[]
    responseType?: 'promise' | 'observable'
  }
  // 多应用列表
  applications?: Record<string, string>
  // 追加service
  appendService?: boolean
}

/**
 * 生成应用选项
 */
export type GenerateApplicationOptions = Pick<
  GenerateOptions,
  'exportModels' | 'output'
> & {
  // 服务名称
  name?: string
  // 应用名称
  application?: string
  // OPENAPI地址
  input: string
}
