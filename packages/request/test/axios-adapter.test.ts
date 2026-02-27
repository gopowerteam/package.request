import type { AdapterResponse } from '../src/interfaces/request-adapter.interface'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosAdapter } from '../src/adapters/axios.adapter'

// Mock axios 模块，避免真实网络请求
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
    })),
  },
}))

describe('axiosAdapter - Axios HTTP 客户端适配器', () => {
  let adapter: AxiosAdapter

  beforeEach(() => {
    adapter = new AxiosAdapter()
    vi.clearAllMocks()
  })

  describe('injectConfig - 注入配置', () => {
    it('应存储配置到适配器实例', () => {
      const config = {
        gateway: 'https://api.example.com',
        timeout: 5000,
      } as any

      adapter.injectConfig(config)

      expect((adapter as any).config).toBe(config)
    })
  })

  describe('transformResponse - 转换成功响应', () => {
    it('应将 AxiosResponse 转换为 AdapterResponse 格式', () => {
      // 模拟 Axios 响应对象
      const axiosResponse = {
        data: { id: 1, name: 'test' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {} as any,
        request: {} as any,
      }

      const result = adapter.transformResponse(axiosResponse)

      expect(result).toEqual({
        data: { id: 1, name: 'test' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      } as AdapterResponse)
    })

    it('应正确处理空数据响应（如 204 No Content）', () => {
      const axiosResponse = {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {} as any,
        request: {} as any,
      }

      const result = adapter.transformResponse(axiosResponse)

      expect(result.data).toBeNull()
      expect(result.status).toBe(204)
    })

    it('应正确处理数组类型响应数据', () => {
      const axiosResponse = {
        data: [{ id: 1 }, { id: 2 }],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
        request: {} as any,
      }

      const result = adapter.transformResponse(axiosResponse)

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('transformException - 转换异常响应', () => {
    it('应正确转换包含响应体的 AxiosError', () => {
      // 模拟 404 错误响应
      const axiosError = {
        response: {
          data: { message: 'Not Found' },
          status: 404,
          statusText: 'Not Found',
          headers: { 'content-type': 'application/json' },
        },
      } as any

      const result = adapter.transformException(axiosError)

      expect(result).toEqual({
        data: { message: 'Not Found' },
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      })
    })

    it('应正确处理无响应体的错误（如网络错误）', () => {
      // 模拟网络错误，无 response 对象
      const axiosError = {
        response: undefined,
      } as any

      const result = adapter.transformException(axiosError)

      // 应返回默认错误响应
      expect(result).toEqual({
        data: {},
        status: 400,
        statusText: '',
        headers: {},
      })
    })

    it('应正确处理网络错误（无响应）', () => {
      const axiosError = {
        response: undefined,
        message: 'Network Error',
      } as any

      const result = adapter.transformException(axiosError)

      expect(result.status).toBe(400)
      expect(result.data).toEqual({})
    })

    it('应正确处理 500 服务器错误', () => {
      const axiosError = {
        response: {
          data: { error: 'Internal Server Error' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
        },
      } as any

      const result = adapter.transformException(axiosError)

      expect(result.status).toBe(500)
      expect(result.data).toEqual({ error: 'Internal Server Error' })
    })
  })
})
