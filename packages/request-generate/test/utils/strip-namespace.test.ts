import { describe, expect, it } from 'vitest'
import { stripNamespace } from '../../src/parse/v3/strip-namespace'

describe('stripNamespace - 剥离 OpenAPI v3 组件命名空间', () => {
  describe('openAPI v3 组件引用 ($ref) 处理', () => {
    it('应剥离 #/components/schemas/ 前缀', () => {
      expect(stripNamespace('#/components/schemas/User')).toBe('User')
      expect(stripNamespace('#/components/schemas/PetResponse')).toBe('PetResponse')
    })

    it('应剥离 #/components/responses/ 前缀', () => {
      expect(stripNamespace('#/components/responses/NotFound')).toBe('NotFound')
      expect(stripNamespace('#/components/responses/Success')).toBe('Success')
    })

    it('应剥离 #/components/parameters/ 前缀', () => {
      expect(stripNamespace('#/components/parameters/IdParam')).toBe('IdParam')
      expect(stripNamespace('#/components/parameters/LimitParam')).toBe('LimitParam')
    })

    it('应剥离 #/components/examples/ 前缀', () => {
      expect(stripNamespace('#/components/examples/UserExample')).toBe('UserExample')
    })

    it('应剥离 #/components/requestBodies/ 前缀', () => {
      expect(stripNamespace('#/components/requestBodies/UserBody')).toBe('UserBody')
    })

    it('应剥离 #/components/headers/ 前缀', () => {
      expect(stripNamespace('#/components/headers/RateLimit')).toBe('RateLimit')
    })

    it('应剥离 #/components/securitySchemes/ 前缀', () => {
      expect(stripNamespace('#/components/securitySchemes/BearerAuth')).toBe('BearerAuth')
    })

    it('应剥离 #/components/links/ 前缀', () => {
      expect(stripNamespace('#/components/links/UserLink')).toBe('UserLink')
    })

    it('应剥离 #/components/callbacks/ 前缀', () => {
      expect(stripNamespace('#/components/callbacks/WebhookCallback')).toBe('WebhookCallback')
    })
  })

  describe('边界情况', () => {
    it('不匹配任何模式时应返回原值', () => {
      expect(stripNamespace('User')).toBe('User')
      expect(stripNamespace('SomeType')).toBe('SomeType')
    })

    it('应处理带空白字符的值', () => {
      expect(stripNamespace('  #/components/schemas/User  ')).toBe('User')
      expect(stripNamespace('\t#/components/schemas/Pet\t')).toBe('Pet')
    })

    it('应处理空字符串', () => {
      expect(stripNamespace('')).toBe('')
    })

    it('不应剥离 OpenAPI v2 的定义路径', () => {
      // v2 使用 #/definitions/ 而非 #/components/schemas/
      expect(stripNamespace('#/definitions/User')).toBe('#/definitions/User')
      expect(stripNamespace('#/parameters/IdParam')).toBe('#/parameters/IdParam')
    })
  })
})
