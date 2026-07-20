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
  // body 的 OpenAPI media-type 字符串(仅 parametersBody 可用)
  // 仅当 media 为"已知非 JSON 家族"时写入(multipart/binary/urlencoded/text),
  // 用于模板注入精确的 Content-Type 头。
  // JSON 家族 / $ref body / 未知 media → undefined → 走 axios 实例默认的 application/json。
  mediaType?: string
}
