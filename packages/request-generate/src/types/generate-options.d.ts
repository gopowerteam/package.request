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
  // 输出Model路径
  exportServices?: {
    serviceResolve?: (
      path: string,
      method: string,
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject,
      tags: OpenAPIV2.TagObject[]
    ) => string
    operationResolve?: (
      path: string,
      method: string,
      object: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject
    ) => string
  }
  // 多应用列表
  applications?: Record<string, string>
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
  // OPENAPI地址
  input: string
}
