import type { OpenAPIV3 } from 'openapi-types'
import { afterEach, describe, expect, it } from 'vitest'
import { Generate } from '../../src/generate'
import { getServiceName } from '../../src/utils/get-service-name'

describe('getServiceName - 名称消毒', () => {
  afterEach(() => {
    // 重置 Generate.options 避免污染其他测试

    ;(Generate as any).options = undefined
  })

  describe('用户 serviceResolve 路径', () => {
    it('返回连字符名时应转为 PascalCase(本次 bug 核心)', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
        exportServices: {
          serviceResolve: () => 'xbt-sca-open-controller',
        },
      }

      const result = getServiceName('/x', 'get', { tags: ['x'] } as OpenAPIV3.OperationObject, [])
      expect(result).toBe('XbtScaOpenController')
    })

    it('返回 snake_case 名时应转为 PascalCase', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
        exportServices: {
          serviceResolve: () => 'user_service',
        },
      }

      expect(getServiceName('/x', 'get', { tags: ['x'] } as OpenAPIV3.OperationObject, [])).toBe('UserService')
    })

    it('返回数组时应逐项消毒', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
        exportServices: {
          serviceResolve: () => ['user-service', 'admin-api', 'Default'],
        },
      }

      const result = getServiceName('/x', 'get', { tags: ['x'] } as OpenAPIV3.OperationObject, [])
      expect(result).toEqual(['UserService', 'AdminApi', 'Default'])
    })

    it('返回已规范的 PascalCase 名时应保持不变(幂等)', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
        exportServices: {
          serviceResolve: () => 'UserService',
        },
      }

      expect(getServiceName('/x', 'get', { tags: ['x'] } as OpenAPIV3.OperationObject, [])).toBe('UserService')
    })

    it('返回 default 字面量时应转为 Default', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
        exportServices: {
          serviceResolve: () => 'default',
        },
      }

      expect(getServiceName('/x', 'get', { tags: ['x'] } as OpenAPIV3.OperationObject, [])).toBe('Default')
    })
  })

  describe('默认路径(无 serviceResolve)', () => {
    it('应使用 getCamelName 处理 tag', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
      }

      const result = getServiceName('/x', 'get', { tags: ['user-service'] } as OpenAPIV3.OperationObject, [])
      expect(result).toEqual(['UserService'])
    })

    it('多个 tag 时应返回多个名称', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
      }

      const result = getServiceName('/x', 'get', {
        tags: ['user-service', 'admin-api'],
      } as OpenAPIV3.OperationObject, [])
      expect(result).toEqual(['UserService', 'AdminApi'])
    })

    it('无 tag 应回退到 Default', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '',
        exportModels: false,
      }

      expect(getServiceName('/x', 'get', {} as OpenAPIV3.OperationObject, [])).toBe('Default')
    })

    it('无 Generate.options 时也应回退到默认逻辑', () => {
      ;(Generate as any).options = undefined

      expect(getServiceName('/x', 'get', { tags: ['foo-bar'] } as OpenAPIV3.OperationObject, [])).toEqual(['FooBar'])
    })
  })
})
