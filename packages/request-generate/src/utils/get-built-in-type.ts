const TYPE_MAPPINGS = new Map<string, string>([
  ['MapStringObject', 'Record<string, any>']
])

/**
 * 获取对应类型
 */
export const getBuiltInType = (ref: string): string | undefined => {
  return TYPE_MAPPINGS.get(ref)
}
