import { describe, expect, it } from 'vitest'
import { toUpperHelper } from '../../src/template-helpers/to-upper.helper'

describe('toUpperHelper - Handlebars 大写转换助手函数', () => {
  it('助手函数名称应为 "to-upper"', () => {
    expect(toUpperHelper.name).toBe('to-upper')
  })

  describe('全大写转换（默认行为）', () => {
    it('应将整个字符串转换为大写', () => {
      expect(toUpperHelper.fn.call({}, 'hello')).toBe('HELLO')
      expect(toUpperHelper.fn.call({}, 'Hello World')).toBe('HELLO WORLD')
    })

    it('应保持已大写的字符串不变', () => {
      expect(toUpperHelper.fn.call({}, 'HELLO')).toBe('HELLO')
    })

    it('应处理空字符串', () => {
      expect(toUpperHelper.fn.call({}, '')).toBe('')
    })
  })

  describe('仅首字母大写（onlyFirst = true）', () => {
    it('onlyFirst 为 true 时应只大写首字母', () => {
      expect(toUpperHelper.fn.call({}, 'hello', true)).toBe('Hello')
      expect(toUpperHelper.fn.call({}, 'hello world', true)).toBe('Hello world')
    })

    it('首字母已大写时应保持不变', () => {
      expect(toUpperHelper.fn.call({}, 'Hello', true)).toBe('Hello')
    })

    it('应处理空字符串', () => {
      expect(toUpperHelper.fn.call({}, '', true)).toBe('')
    })

    it('应处理单个字符', () => {
      expect(toUpperHelper.fn.call({}, 'h', true)).toBe('H')
      expect(toUpperHelper.fn.call({}, 'H', true)).toBe('H')
    })
  })

  describe('特殊字符处理', () => {
    it('应正确处理包含数字的字符串', () => {
      expect(toUpperHelper.fn.call({}, 'test123')).toBe('TEST123')
      expect(toUpperHelper.fn.call({}, 'test123', true)).toBe('Test123')
    })

    it('应正确处理包含特殊字符的字符串', () => {
      expect(toUpperHelper.fn.call({}, 'hello-world')).toBe('HELLO-WORLD')
      // 首字符为特殊字符时不会改变
      expect(toUpperHelper.fn.call({}, '_private', true)).toBe('_private')
    })
  })
})
