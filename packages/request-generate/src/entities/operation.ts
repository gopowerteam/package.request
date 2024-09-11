import { Generate } from '../generate'
import type { OperationParameter } from './operation-parameter'

export class Operation {
  // Operation名称
  name: string
  // Operation Method
  method: string
  // Operation地址
  path: string
  // Operation注释
  description?: string
  // response类型
  responseRef: string
  // 返回类型
  responseType: 'promise' | 'observable'
  // Query参数
  parametersPath: OperationParameter[] = []
  // Body参数
  parametersQuery: OperationParameter[] = []
  // path参数
  parametersBody?: OperationParameter
  // 导入操作
  imports: string[] = []

  constructor(name: string, method: string, path: string) {
    this.name = name
    this.method = method
    this.path = path

    this.responseType
      = Generate.options?.exportServices?.responseType || 'promise'
  }
}
