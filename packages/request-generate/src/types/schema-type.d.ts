export type SchemaType = {
  // 字段类型
  type: string
  // 引用类型
  ref?: string
  // 导入类型
  imports?: string[]
  // 枚举
  enums?: string[]
}
