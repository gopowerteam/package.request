/**
 * 查询字符串工具函数
 * 用于替代 qs 库，适用于微信小程序环境
 */

export interface QueryStringifyOptions {
  /** 数组格式，默认 'repeat' */
  arrayFormat?: 'repeat' | 'brackets' | 'indices' | 'comma' | 'none'
  /** 跳过 null 值，默认 true */
  skipNulls?: boolean
  /** 允许点号，默认 true */
  allowDots?: boolean
  /** 只编码值，默认 false */
  encodeValuesOnly?: boolean
  /** 启用编码，默认 true */
  encode?: boolean
  /** 添加查询前缀，默认 false */
  addQueryPrefix?: boolean
}

/**
 * 编码字符串
 */
function encodeValue(value: string, encode: boolean): string {
  if (!encode)
    return value
  return encodeURIComponent(value)
}

/**
 * 处理嵌套对象的键名
 */
function getKeyWithDot(key: string, childKey: string, allowDots: boolean): string {
  return allowDots ? `${key}.${childKey}` : `${key}[${childKey}]`
}

/**
 * 递归处理对象值
 */
function processValue(
  value: any,
  options: QueryStringifyOptions,
  parentKey = '',
): string[] {
  const result: string[] = []

  if (value === null || value === undefined) {
    if (!options.skipNulls) {
      result.push(`${parentKey}=`)
    }
    return result
  }

  if (Array.isArray(value)) {
    if (options.arrayFormat === 'comma') {
      // comma 格式：将数组合并为逗号分隔的字符串
      const filteredValues = value.filter(item => item !== null && item !== undefined)
      if (filteredValues.length > 0) {
        const commaValue = filteredValues.map(item =>
          typeof item === 'object' ? JSON.stringify(item) : item.toString(),
        ).join(',')
        const shouldEncode = options.encode !== false
        const encodedValue = encodeValue(commaValue, shouldEncode)
        result.push(`${parentKey}=${encodedValue}`)
      }
    }
    else {
      value.forEach((item, index) => {
        let itemKey: string
        const shouldEncode = options.encode !== false

        if (options.arrayFormat === 'indices') {
          // 构建索引格式的键名
          itemKey = parentKey ? `${parentKey}[${index}]` : `[${index}]`
        }
        else if (options.arrayFormat === 'brackets') {
          // 构建括号格式的键名
          itemKey = parentKey ? `${parentKey}[]` : '[]'
        }
        else {
          // repeat 格式，直接使用父键名
          itemKey = parentKey
        }

        if (typeof item === 'object' && item !== null) {
          result.push(...processValue(item, options, itemKey))
        }
        else {
          const encodedValue = encodeValue(item.toString(), shouldEncode)
          result.push(`${itemKey}=${encodedValue}`)
        }
      })
    }
  }
  else if (typeof value === 'object') {
    Object.keys(value).forEach((childKey) => {
      const fullKey = parentKey
        ? getKeyWithDot(parentKey, childKey, options.allowDots || false)
        : childKey

      result.push(...processValue(value[childKey], options, fullKey))
    })
  }
  else {
    const shouldEncode = options.encode !== false
    const encodedValue = encodeValue(value.toString(), shouldEncode)
    const encodedKey = options.encodeValuesOnly
      ? parentKey
      : encodeValue(parentKey, shouldEncode)
    result.push(`${encodedKey}=${encodedValue}`)
  }

  return result
}

/**
 * 将对象序列化为查询字符串
 */
export function stringify(
  obj: Record<string, any>,
  options: QueryStringifyOptions = {},
): string {
  const {
    arrayFormat = 'indices',
    skipNulls = true,
    allowDots = true,
    encodeValuesOnly = false,
    encode = true,
    addQueryPrefix = false,
  } = options

  if (!obj || typeof obj !== 'object') {
    return options.addQueryPrefix ? '?' : ''
  }

  const parts: string[] = []

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const processedValues = processValue(value, {
      arrayFormat,
      skipNulls,
      allowDots,
      encodeValuesOnly,
      encode,
      addQueryPrefix,
    }, key)

    parts.push(...processedValues)
  })

  const queryString = parts.join('&')
  return addQueryPrefix ? (queryString ? `?${queryString}` : '?') : queryString
}
