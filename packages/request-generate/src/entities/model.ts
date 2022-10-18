import type { Field } from './field'

export class Model {
  // Model名称
  name: string
  // 字段列表
  fields: Field[]
  // 导入列表
  imports: string[]

  constructor(name: string) {
    this.name = name
  }
}
