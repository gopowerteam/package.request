export class OperationParameter {
  // 参数位置
  in: 'path' | 'query' | 'body'
  // 参数名称
  name: string
  // 参数类型
  type: string
  // 参数引用
  ref?: string
  // 参数枚举
  enums?: string[]
  // 参数注释
  description?: string
  // 是否必填
  required?: boolean
  // 导入类型
  imports: string[] = []
}
