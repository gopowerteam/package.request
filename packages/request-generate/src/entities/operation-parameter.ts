export class OperationParameter {
  // 参数位置
  in: 'path' | 'query' | 'body'
  // 参数名称
  name: string
  // 参数类型
  type: string
  // 参数引用
  ref?: string
  // 导入类型
  imports: string[] = []
}
