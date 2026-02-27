import { describe, expect, it } from 'vitest'
import { equalHelper } from '../../src/template-helpers/equal.helper'

describe('equalHelper - Handlebars 相等比较助手函数', () => {
  // 模拟 Handlebars options 对象
  const createMockOptions = (fnResult: string, inverseResult: string) => ({
    fn: () => fnResult,
    inverse: () => inverseResult,
  })

  it('助手函数名称应为 "equal"', () => {
    expect(equalHelper.name).toBe('equal')
  })

  describe('字符串比较', () => {
    it('字符串相等时应返回 fn 结果（真分支）', () => {
      const options = createMockOptions('true block', 'false block')
      const result = equalHelper.fn.call({}, 'hello', 'hello', options)
      expect(result).toBe('true block')
    })

    it('字符串不相等时应返回 inverse 结果（假分支）', () => {
      const options = createMockOptions('true block', 'false block')
      const result = equalHelper.fn.call({}, 'hello', 'world', options)
      expect(result).toBe('false block')
    })

    it('比较应区分大小写', () => {
      const options = createMockOptions('true block', 'false block')
      const result = equalHelper.fn.call({}, 'Hello', 'hello', options)
      expect(result).toBe('false block')
    })
  })

  describe('数字比较', () => {
    it('数字相等时应返回 fn 结果', () => {
      const options = createMockOptions('true block', 'false block')
      const result = equalHelper.fn.call({}, 42, 42, options)
      expect(result).toBe('true block')
    })

    it('数字不相等时应返回 inverse 结果', () => {
      const options = createMockOptions('true block', 'false block')
      const result = equalHelper.fn.call({}, 42, 24, options)
      expect(result).toBe('false block')
    })
  })

  describe('布尔值比较', () => {
    it('布尔值相等时应返回 fn 结果', () => {
      const options = createMockOptions('true block', 'false block')
      expect(equalHelper.fn.call({}, true, true, options)).toBe('true block')
      expect(equalHelper.fn.call({}, false, false, options)).toBe('true block')
    })

    it('布尔值不相等时应返回 inverse 结果', () => {
      const options = createMockOptions('true block', 'false block')
      expect(equalHelper.fn.call({}, true, false, options)).toBe('false block')
    })
  })

  describe('null 和 undefined 比较', () => {
    it('应正确处理 null 比较', () => {
      const options = createMockOptions('true block', 'false block')
      expect(equalHelper.fn.call({}, null, null, options)).toBe('true block')
      expect(equalHelper.fn.call({}, null, undefined, options)).toBe('false block')
    })

    it('应正确处理 undefined 比较', () => {
      const options = createMockOptions('true block', 'false block')
      expect(equalHelper.fn.call({}, undefined, undefined, options)).toBe('true block')
    })
  })

  describe('对象比较', () => {
    it('对象比较基于引用（非深度比较）', () => {
      const options = createMockOptions('true block', 'false block')
      const obj = { a: 1 }
      // 同一引用应相等
      expect(equalHelper.fn.call({}, obj, obj, options)).toBe('true block')
      // 不同引用即使内容相同也不相等
      expect(equalHelper.fn.call({}, { a: 1 }, { a: 1 }, options)).toBe('false block')
    })
  })
})
