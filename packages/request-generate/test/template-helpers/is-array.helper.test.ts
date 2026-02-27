import { describe, expect, it } from 'vitest'
import { isArrayHelper } from '../../src/template-helpers/is-array.helper'

describe('isArrayHelper - Handlebars 数组检测助手函数', () => {
  // 模拟 Handlebars options 对象
  const createMockOptions = (fnResult: string, inverseResult: string) => ({
    fn: () => fnResult,
    inverse: () => inverseResult,
  })

  it('助手函数名称应为 "is-array"', () => {
    expect(isArrayHelper.name).toBe('is-array')
  })

  describe('数组检测', () => {
    it('数组类型应返回 fn 结果（真分支）', () => {
      const options = createMockOptions('is array', 'not array')
      expect(isArrayHelper.fn.call({}, [1, 2, 3], options)).toBe('is array')
      expect(isArrayHelper.fn.call({}, [], options)).toBe('is array')
      expect(isArrayHelper.fn.call({}, ['a', 'b'], options)).toBe('is array')
    })

    it('非数组类型应返回 inverse 结果（假分支）', () => {
      const options = createMockOptions('is array', 'not array')
      expect(isArrayHelper.fn.call({}, 'string', options)).toBe('not array')
      expect(isArrayHelper.fn.call({}, 123, options)).toBe('not array')
      expect(isArrayHelper.fn.call({}, { a: 1 }, options)).toBe('not array')
      expect(isArrayHelper.fn.call({}, null, options)).toBe('not array')
      expect(isArrayHelper.fn.call({}, undefined, options)).toBe('not array')
    })
  })

  describe('边界情况', () => {
    it('类数组对象不应被识别为数组', () => {
      const options = createMockOptions('is array', 'not array')
      // 类数组对象：有 length 属性和数字索引，但不是真正的数组
      const arrayLike = { 0: 'a', 1: 'b', length: 2 }
      expect(isArrayHelper.fn.call({}, arrayLike, options)).toBe('not array')
    })

    it('嵌套数组应被正确识别', () => {
      const options = createMockOptions('is array', 'not array')
      expect(isArrayHelper.fn.call({}, [[1, 2], [3, 4]], options)).toBe('is array')
    })
  })
})
