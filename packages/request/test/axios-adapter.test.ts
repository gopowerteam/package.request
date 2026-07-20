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

describe('axiosAdapter - Content-Type 注入(按运行时 body 类型)', () => {
  // 取最近一次 axiosInstance.request 调用的参数
  const lastRequestCall = (): any => {
    const cachedInstance = (AxiosAdapter as any).axiosInstance
    return cachedInstance.request.mock.calls.at(-1)[0]
  }

  const setupAdapter = (): AxiosAdapter => {
    const a = new AxiosAdapter()
    a.injectConfig({ gateway: 'https://api.test' } as any)
    return a
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // 重置静态缓存的 axiosInstance,确保每个用例独立触发 create + headers 流程
    ;(AxiosAdapter as any).axiosInstance = undefined
  })

  it('formData body 应设置 Content-Type: false(让浏览器补 boundary)', async () => {
    const adapter = setupAdapter()
    const fd = new FormData()
    fd.append('file', new Blob(['x']), 't.txt')

    await adapter.request({
      baseURL: '',
      pathURL: '/upload',
      method: 'POST',
      headers: {},
      paramsBody: fd,
    })

    expect(lastRequestCall().headers['Content-Type']).toBe(false)
  })

  it('uRLSearchParams body 应设置 Content-Type: false', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/form',
      method: 'POST',
      headers: {},
      paramsBody: new URLSearchParams('a=1'),
    })

    expect(lastRequestCall().headers['Content-Type']).toBe(false)
  })

  it('blob body 应设置 Content-Type: application/octet-stream(A 端兜底)', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/upload',
      method: 'POST',
      headers: {},
      paramsBody: new Blob(['x']),
    })

    expect(lastRequestCall().headers['Content-Type']).toBe('application/octet-stream')
  })

  it('普通对象 body 不应注入 Content-Type(走 axios 实例默认的 application/json)', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/users',
      method: 'POST',
      headers: {},
      paramsBody: { name: 'foo' },
    })

    expect(lastRequestCall().headers['Content-Type']).toBeUndefined()
  })

  it('无 body GET 不应注入 Content-Type', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    })

    expect(lastRequestCall().headers['Content-Type']).toBeUndefined()
  })

  it('调用方显式设置 Content-Type 时不应被覆盖', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/upload',
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf' },
      paramsBody: new Blob(['x']),
    })

    expect(lastRequestCall().headers['Content-Type']).toBe('application/pdf')
  })

  it('大小写不敏感识别调用方已设的 content-type', async () => {
    const adapter = setupAdapter()

    await adapter.request({
      baseURL: '',
      pathURL: '/upload',
      method: 'POST',
      headers: { 'content-type': 'text/xml' },
      paramsBody: new Blob(['x']),
    })

    expect(lastRequestCall().headers['content-type']).toBe('text/xml')
    expect(lastRequestCall().headers['Content-Type']).toBeUndefined()
  })
})
