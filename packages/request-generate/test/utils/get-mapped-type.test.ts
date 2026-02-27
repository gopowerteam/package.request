import { describe, expect, it } from 'vitest'
import { getMappedType } from '../../src/utils/get-mapped-type'

describe('getMappedType - OpenAPI 类型映射到 TypeScript 类型', () => {
  describe('基本类型映射', () => {
    it('应将 string 映射为 string', () => {
      expect(getMappedType('string')).toBe('string')
    })

    it('应将 number 映射为 number', () => {
      expect(getMappedType('number')).toBe('number')
    })

    it('应将 boolean 映射为 boolean', () => {
      expect(getMappedType('boolean')).toBe('boolean')
    })

    it('应将 void 映射为 void', () => {
      expect(getMappedType('void')).toBe('void')
    })

    it('应将 null 映射为 null', () => {
      expect(getMappedType('null')).toBe('null')
    })
  })

  describe('整数类型映射 - 统一映射为 number', () => {
    it('应将 integer 映射为 number', () => {
      expect(getMappedType('integer')).toBe('number')
    })

    it('应将 int 映射为 number', () => {
      expect(getMappedType('int')).toBe('number')
    })

    it('应将 long 映射为 number', () => {
      expect(getMappedType('long')).toBe('number')
    })

    it('应将 short 映射为 number', () => {
      expect(getMappedType('short')).toBe('number')
    })

    it('应将 byte 映射为 number', () => {
      expect(getMappedType('byte')).toBe('number')
    })

    it('应将 float 映射为 number', () => {
      expect(getMappedType('float')).toBe('number')
    })

    it('应将 double 映射为 number', () => {
      expect(getMappedType('double')).toBe('number')
    })
  })

  describe('字符串格式类型 - 映射为 string', () => {
    it('应将 char 映射为 string', () => {
      expect(getMappedType('char')).toBe('string')
    })

    it('应将 date 映射为 string', () => {
      expect(getMappedType('date')).toBe('string')
    })

    it('应将 date-time 映射为 string', () => {
      expect(getMappedType('date-time')).toBe('string')
    })

    it('应将 password 映射为 string', () => {
      expect(getMappedType('password')).toBe('string')
    })
  })

  describe('特殊类型映射', () => {
    it('应将 file 映射为 binary', () => {
      expect(getMappedType('file')).toBe('binary')
    })

    it('应将 array 映射为 any[]', () => {
      expect(getMappedType('array')).toBe('any[]')
    })

    it('应将 object 映射为 any', () => {
      expect(getMappedType('object')).toBe('any')
    })

    it('应将 any 映射为 any', () => {
      expect(getMappedType('any')).toBe('any')
    })
  })

  describe('format 参数处理', () => {
    it('当 format 为 binary 时应返回 binary', () => {
      expect(getMappedType('string', 'binary')).toBe('binary')
    })

    it('当 format 为 binary 时应忽略 type 参数', () => {
      expect(getMappedType('object', 'binary')).toBe('binary')
      expect(getMappedType('any', 'binary')).toBe('binary')
    })

    it('应忽略非 binary 的 format 参数', () => {
      expect(getMappedType('string', 'date')).toBe('string')
      expect(getMappedType('integer', 'int64')).toBe('number')
    })
  })

  describe('边界情况', () => {
    it('未知类型应返回 any', () => {
      expect(getMappedType('unknown')).toBe('any')
      expect(getMappedType('custom')).toBe('any')
    })

    it('未提供 type 时应默认返回 any（基于 object 类型）', () => {
      expect(getMappedType()).toBe('any')
      expect(getMappedType(undefined)).toBe('any')
    })

    it('空字符串应返回 any', () => {
      expect(getMappedType('')).toBe('any')
    })
  })
})
