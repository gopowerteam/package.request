export class Field {
  // 字段名称
  name: string
  // 是否必填
  required: boolean
  // 字段类型
  type: string
  // 引用类型
  ref?: string
  // 字段枚举
  enum?: string[]
  // 描述信息
  description?: string
  // 导入类型
  imports?: string[]

  constructor(name: string, required: boolean) {
    this.name = name
    this.required = required
  }
}
