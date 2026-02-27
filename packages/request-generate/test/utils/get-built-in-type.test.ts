import { describe, expect, it } from 'vitest'
import { getBuiltInType } from '../../src/utils/get-built-in-type'

describe('getBuiltInType - 获取内置类型映射', () => {
  describe('内置类型映射', () => {
    it('应将 MapStringObject 映射为 Record<string, any>', () => {
      expect(getBuiltInType('MapStringObject')).toBe('Record<string, any>')
    })
  })

  describe('未知类型处理', () => {
    it('未知类型应返回 undefined', () => {
      expect(getBuiltInType('UnknownType')).toBeUndefined()
      expect(getBuiltInType('CustomType')).toBeUndefined()
    })

    it('空字符串应返回 undefined', () => {
      expect(getBuiltInType('')).toBeUndefined()
    })
  })

  describe('大小写敏感性', () => {
    it('类型名称区分大小写', () => {
      expect(getBuiltInType('mapstringobject')).toBeUndefined()
      expect(getBuiltInType('MAPSTRINGOBJECT')).toBeUndefined()
      expect(getBuiltInType('MapStringobject')).toBeUndefined()
    })
  })
})
