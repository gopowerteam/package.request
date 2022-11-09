import { Generate } from '../generate'
import type { Operation } from './operation'

export class Service {
  constructor(name: string) {
    this.name = name

    this.responseType =
      Generate.options?.exportServices?.responseType || 'promise'
  }

  // 服务名称
  name: string
  // 应用名称
  application?: string
  // 导出Model
  imports: string[] = []
  // 操作列表
  operations: Operation[] = []
  // 返回类型
  responseType: 'promise' | 'observable'
}
