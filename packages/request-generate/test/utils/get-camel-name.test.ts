import { describe, expect, it } from 'vitest'
import { getCamelName } from '../../src/utils/get-camel-name'

describe('getCamelName - 将字符串转换为 PascalCase 格式', () => {
  describe('基本转换', () => {
    it('应将首字母大写', () => {
      expect(getCamelName('user')).toBe('User')
      expect(getCamelName('service')).toBe('Service')
    })

    it('应保持已大写的字符串', () => {
      expect(getCamelName('User')).toBe('User')
      expect(getCamelName('UserService')).toBe('UserService')
    })
  })

  describe('下划线处理', () => {
    it('应将 snake_case 转换为 PascalCase', () => {
      expect(getCamelName('user_service')).toBe('UserService')
      expect(getCamelName('api_controller')).toBe('ApiController')
    })

    it('应处理连续多个下划线', () => {
      expect(getCamelName('user__service')).toBe('UserService')
      expect(getCamelName('__user_service__')).toBe('UserService')
    })

    it('应处理末尾下划线', () => {
      expect(getCamelName('user_service_')).toBe('UserService')
    })
  })

  describe('特殊字符处理', () => {
    it('应将非单词字符替换为下划线后再转换', () => {
      expect(getCamelName('user-service')).toBe('UserService')
      expect(getCamelName('user.service')).toBe('UserService')
      expect(getCamelName('user service')).toBe('UserService')
    })

    it('应处理混合特殊字符', () => {
      expect(getCamelName('user-service_name')).toBe('UserServiceName')
      expect(getCamelName('api.v2_controller')).toBe('ApiV2Controller')
    })
  })

  describe('数字处理', () => {
    it('应移除开头的数字', () => {
      expect(getCamelName('123user')).toBe('User')
      expect(getCamelName('1service')).toBe('Service')
    })

    it('应保留中间的数字', () => {
      expect(getCamelName('user2service')).toBe('User2service')
      expect(getCamelName('api_v2')).toBe('ApiV2')
    })
  })

  describe('边界情况', () => {
    it('应处理空字符串', () => {
      expect(getCamelName('')).toBe('')
    })

    it('应处理仅包含非字母字符的字符串', () => {
      expect(getCamelName('123')).toBe('')
      expect(getCamelName('___')).toBe('')
      expect(getCamelName('---')).toBe('')
    })

    it('应去除首尾空白字符', () => {
      expect(getCamelName('  user  ')).toBe('User')
      expect(getCamelName('\tuser\n')).toBe('User')
    })
  })

  describe('典型使用场景', () => {
    it('应处理控制器名称', () => {
      expect(getCamelName('user-controller')).toBe('UserController')
      expect(getCamelName('order_service')).toBe('OrderService')
    })

    it('应处理 API 路径', () => {
      expect(getCamelName('/api/users')).toBe('ApiUsers')
      expect(getCamelName('api/v1/users')).toBe('ApiV1Users')
    })

    it('应处理 OpenAPI 标签名称', () => {
      expect(getCamelName('pet-store')).toBe('PetStore')
      expect(getCamelName('user_management')).toBe('UserManagement')
    })
  })
})
