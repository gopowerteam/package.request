const TYPE_MAPPINGS = new Map<string, string>([
  ['file', 'binary'],
  ['any', 'any'],
  ['object', 'any'],
  ['array', 'any[]'],
  ['boolean', 'boolean'],
  ['byte', 'number'],
  ['int', 'number'],
  ['integer', 'number'],
  ['float', 'number'],
  ['double', 'number'],
  ['short', 'number'],
  ['long', 'number'],
  ['number', 'number'],
  ['char', 'string'],
  ['date', 'string'],
  ['date-time', 'string'],
  ['password', 'string'],
  ['string', 'string'],
  ['void', 'void'],
  ['null', 'null'],
])

/**
 * 获取对应类型
 */
export function getMappedType(type = 'object', format?: string): string {
  if (format === 'binary') {
    return 'binary'
  }

  return TYPE_MAPPINGS.get(type) || 'any'
}
