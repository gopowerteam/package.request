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
  /** 按键名排序，每层对象递归生效；不传时保持原始键序 */
  sort?: (a: string, b: string) => number
  /** 值过滤，返回 undefined 时丢弃该键值对；优先级高于 skipNulls */
  filter?: (prefix: string, value: unknown) => unknown
}

/**
 * 请求服务默认序列化选项
 *
 * axios 适配器与 `toURL()` 共用，避免两处默认值漂移。
 */
export const DEFAULT_QUERY_OPTIONS: QueryStringifyOptions = {
  arrayFormat: 'repeat',
  skipNulls: true,
  allowDots: true,
  encodeValuesOnly: true,
  encode: true,
  sort: (a: string, b: string) => a.localeCompare(b),
  filter: (_prefix: string, value: unknown) =>
    ['', undefined, null].includes(value as string)
      ? undefined
      : value,
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
  return allowDots
    ? `${key}.${childKey}`
    : `${key}[${childKey}]`
}

/**
 * 按键名排序（sort 选项为函数时才排序）
 */
function sortKeys(keys: string[], sort?: (a: string, b: string) => number): string[] {
  return sort
    ? [...keys].sort(sort)
    : keys
}

/**
 * 递归处理对象值
 */
function processValue(
  value: unknown,
  options: QueryStringifyOptions,
  parentKey = '',
): string[] {
  const result: string[] = []

  // filter 优先级最高：返回 undefined 时整条键值对丢弃
  if (options.filter) {
    const filtered = options.filter(parentKey, value)
    if (filtered === undefined) {
      return result
    }
    value = filtered
  }

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
          typeof item === 'object'
            ? JSON.stringify(item)
            : item.toString(),
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
          itemKey = parentKey
            ? `${parentKey}[${index}]`
            : `[${index}]`
        }
        else if (options.arrayFormat === 'brackets') {
          // 构建括号格式的键名
          itemKey = parentKey
            ? `${parentKey}[]`
            : '[]'
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
    sortKeys(Object.keys(value), options.sort).forEach((childKey) => {
      const fullKey = parentKey
        ? getKeyWithDot(parentKey, childKey, options.allowDots || false)
        : childKey

      result.push(...processValue((value as Record<string, unknown>)[childKey], options, fullKey))
    })
  }
  else {
    const shouldEncode = options.encode !== false
    const encodedValue = encodeValue(String(value), shouldEncode)
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
  obj: Record<string, unknown>,
  options: QueryStringifyOptions = {},
): string {
  const {
    arrayFormat = 'indices',
    skipNulls = true,
    allowDots = true,
    encodeValuesOnly = false,
    encode = true,
    addQueryPrefix = false,
    sort,
    filter,
  } = options

  if (!obj || typeof obj !== 'object') {
    return options.addQueryPrefix ? '?' : ''
  }

  const parts: string[] = []

  sortKeys(Object.keys(obj), sort).forEach((key) => {
    const value = obj[key]
    const processedValues = processValue(value, {
      arrayFormat,
      skipNulls,
      allowDots,
      encodeValuesOnly,
      encode,
      addQueryPrefix,
      sort,
      filter,
    }, key)

    parts.push(...processedValues)
  })

  const queryString = parts.join('&')
  return addQueryPrefix
    ? (queryString
        ? `?${queryString}`
        : '?')
    : queryString
}
