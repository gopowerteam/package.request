import type { RequestAdapterOptions } from '../src/interfaces/request-adapter.interface'
import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { vi } from 'vitest'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'
import { TestRequestPlugin } from './request-plugin'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from './response-interceptors'

// Mock 适配器：不发起真实网络请求,保证用例离线确定性
class MockAdapter {
  // 为 true 时 request() 抛出异常,模拟网络异常
  public shouldThrow = false
  public lastOptions: RequestAdapterOptions | undefined

  public async request(options: RequestAdapterOptions) {
    this.lastOptions = options
    if (this.shouldThrow)
      throw new Error('模拟网络异常')
    return { data: {}, status: 200, statusText: 'OK', headers: {} }
  }

  public transformResponse(response: any) {
    return response
  }

  public transformException(_exception: any) {
    return { data: {}, status: 400, statusText: '', headers: {} }
  }
}

function createMockSetup() {
  const adapter = new MockAdapter()
  const config: RequestSetupConfig = {
    gateway: 'http://127.0.0.1:9',
    adapter: adapter as any,
    interceptors: {
      status: new StatusInterceptors(),
      success: new SuccessInterceptors(),
      error: new ErrorInterceptors(),
      exception: new ExceptionInterceptors(),
    },
    plugins: [],
  }
  setup(config)
  return { adapter, config }
}

describe('测试RequestService', () => {
  it('测试正常请求', async () => {
    createMockSetup()
    // 请求实例
    const request = RequestService.getInstance()

    // 请求数据
    const data = await request.send(
      {
        path: '/dso-org-service/api/system/setting/all',
        method: 'GET',
      },
      [],
    )

    // 校验结果
    expect(typeof data).toBe('object')
  })

  it('测试异常请求', async () => {
    const errorHandle = vi.fn()
    const exceptionHandle = vi.fn()

    // 模拟网络异常
    const { adapter, config } = createMockSetup()
    adapter.shouldThrow = true
    config.interceptors.exception.exec = exceptionHandle

    // 请求实例
    const request = RequestService.getInstance()
    // 请求数据
    await request
      .send(
        {
          path: '/dso-org-service/api/appModule/all---',
          method: 'GET',
        },
        [],
      )
      .catch(errorHandle)
    // 校验执行
    expect(exceptionHandle).toHaveBeenCalled()
    expect(errorHandle).toHaveBeenCalled()
  })

  it('测试插件正常生命周期', async () => {
    // 配置RequestService
    const beforeHook = vi.fn()
    const afterHook = vi.fn()

    createMockSetup()
    // 请求实例
    const request = RequestService.getInstance()

    const plugin = new TestRequestPlugin()

    plugin.before = () => beforeHook()
    plugin.after = () => afterHook()

    // 请求数据
    await request.send(
      {
        path: '/dso-org-service/api/system/setting/all',
        method: 'GET',
        paramsQuery: {
          a: [1, 2, 3, 4, 5],
        },
      },
      [plugin],
    )

    // 校验执行
    expect(beforeHook).toHaveBeenCalled()
    expect(afterHook).toHaveBeenCalled()
  })

  it('测试插件异常生命周期', async () => {
    // 配置RequestService
    const catchHook = vi.fn()

    const { adapter } = createMockSetup()
    adapter.shouldThrow = true

    // 请求实例
    const request = RequestService.getInstance()

    const plugin = new TestRequestPlugin()

    plugin.catch = () => catchHook()

    // 请求数据
    await request
      .send(
        {
          path: '/dso-org-service/api/appModule/all',
          method: 'POST',
        },
        [plugin],
      )
      .catch(() => {
        //
      })

    expect(catchHook).toHaveBeenCalled()
  })
})
