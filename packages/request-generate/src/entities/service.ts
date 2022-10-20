import type { Operation } from './operation'

export class Service {
  constructor(name: string) {
    this.name = name
  }

  // 服务名称
  name: string
  // 导出Model
  imports: string[] = []
  // 操作列表
  operations: Operation[] = []
}
