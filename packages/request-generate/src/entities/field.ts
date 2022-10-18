export class Field {
  // 字段名称
  name: string
  // 是否必填
  isRequired: boolean
  // 是否引用
  isRef: boolean
  // 是否数组
  isArray: boolean
  // 字段类型
  type: string
  // 引用类型
  ref?: string | string[]
  // 字段枚举
  enum?: string[]
  // 描述信息
  description?: string

  constructor(name: string, required: boolean) {
    this.name = name
    this.isRequired = required
  }
}
