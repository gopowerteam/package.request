import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { beforeEach, describe, expect, it } from 'vitest'
import { AxiosAdapter } from '../src/adapters'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from './response-interceptors'

// 创建模拟的请求配置
function createMockConfig(): RequestSetupConfig {
  return {
    gateway: 'https://api.example.com',
    adapter: new AxiosAdapter(),
    interceptors: {
      status: new StatusInterceptors(),
      success: new SuccessInterceptors(),
      error: new ErrorInterceptors(),
      exception: new ExceptionInterceptors(),
    },
    plugins: [],
  }
}

describe('requestService - toURL 方法测试', () => {
  let request: RequestService

  beforeEach(() => {
    const config = createMockConfig()
    setup(config)
    request = RequestService.getInstance()
  })

  describe('基础 URL 生成', () => {
    it('应生成包含 gateway 和 path 的完整 URL', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
      })

      expect(url).toContain('https://api.example.com/users')
    })

    it('应正确处理无前导斜杠的路径', () => {
      const url = request.toURL({
        path: 'users',
        method: 'GET',
      })

      expect(url).toContain('users')
    })
  })

  describe('查询参数处理', () => {
    it('应正确追加查询参数', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        paramsQuery: {
          page: 1,
          size: 10,
        },
      })

      expect(url).toContain('page=1')
      expect(url).toContain('size=10')
    })

    it('应正确处理数组类型查询参数', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        paramsQuery: {
          ids: [1, 2, 3],
        },
      })

      // 数组参数应使用 repeat 格式
      expect(url).toContain('ids=1')
      expect(url).toContain('ids=2')
      expect(url).toContain('ids=3')
    })

    it('应跳过 null 和 undefined 查询参数', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        paramsQuery: {
          name: 'test',
          value: null as any,
          extra: undefined as any,
        },
      })

      expect(url).toContain('name=test')
      expect(url).not.toContain('value')
      expect(url).not.toContain('extra')
    })

    it('应正确处理空查询参数对象', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        paramsQuery: {},
      })

      expect(url).toContain('https://api.example.com/users')
    })
  })

  describe('路径参数处理', () => {
    it('应替换路径中的占位符参数', () => {
      const url = request.toURL({
        path: '/users/{id}',
        method: 'GET',
        paramsPath: {
          id: '123',
        },
      })

      expect(url).toContain('/users/123')
      expect(url).not.toContain('{id}')
    })

    it('应替换多个路径参数', () => {
      const url = request.toURL({
        path: '/users/{userId}/posts/{postId}',
        method: 'GET',
        paramsPath: {
          userId: 'user1',
          postId: 'post1',
        },
      })

      expect(url).toContain('/users/user1/posts/post1')
    })

    it('应正确处理数字类型路径参数', () => {
      const url = request.toURL({
        path: '/users/{id}',
        method: 'GET',
        paramsPath: {
          id: 123,
        },
      })

      expect(url).toContain('/users/123')
    })
  })

  describe('服务参数处理', () => {
    it('应在路径前添加服务前缀', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        service: 'user-service',
      })

      expect(url).toContain('/user-service/users')
    })

    it('应正确处理带前后斜杠的服务名', () => {
      const url = request.toURL({
        path: '/users',
        method: 'GET',
        service: '/user-service/',
      })

      // 不应出现连续斜杠
      expect(url).not.toContain('//users')
    })
  })

  describe('组合参数测试', () => {
    it('应正确处理所有参数类型的组合', () => {
      const url = request.toURL({
        path: '/users/{id}/posts/{postId}',
        method: 'GET',
        service: 'api',
        paramsPath: {
          id: '123',
          postId: '456',
        },
        paramsQuery: {
          page: 1,
          limit: 10,
        },
      })

      // 验证所有部分都正确处理
      expect(url).toContain('api')
      expect(url).toContain('/users/123/posts/456')
      expect(url).toContain('page=1')
      expect(url).toContain('limit=10')
    })
  })
})

describe('requestService - 错误处理', () => {
  it('未配置时应抛出错误', () => {
    // 清除配置
    ;(RequestService as any).config = undefined
    ;(RequestService as any).instance = undefined

    const freshRequest = new RequestService()

    expect(() => {
      freshRequest.toURL({
        path: '/users',
        method: 'GET',
      })
    }).toThrow('请检查请求配置是否完成')
  })
})

describe('requestService - 单例模式', () => {
  it('setup 后 config 应正确设置', () => {
    const config = createMockConfig()
    setup(config)

    expect(RequestService.config).toBeDefined()
    expect(RequestService.config.gateway).toBe('https://api.example.com')
  })
})
