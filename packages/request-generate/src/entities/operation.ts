import type { OperationParameter } from './operation-parameter'

export class Operation {
  // Operation名称
  name: string
  // Operation Method
  method: string
  // Query参数
  parametersPath: OperationParameter[] = []
  // Body参数
  parametersQuery: OperationParameter[] = []
  // path参数
  parametersBody?: OperationParameter
  // 导入操作
  imports: string[] = []

  constructor(name: string, method: string) {
    this.name = name
    this.method = method
  }
}
