import type { RequestAdapterOptions } from '../src/interfaces/request-adapter.interface'
import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'

// 可捕获 adapter 选项的 Mock 适配器
class MockAdapter {
  public lastOptions: RequestAdapterOptions | undefined

  public async request(options: RequestAdapterOptions) {
    this.lastOptions = options
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
      status: { exec: () => true },
      success: { exec: r => r },
      error: { exec: r => r },
      exception: { exec: r => r },
    },
    plugins: [],
  }
  setup(config)
  return adapter
}

describe('signal 透传', () => {
  it('send() 应将 signal 透传给 adapter.request', async () => {
    const adapter = createMockSetup()
    const controller = new AbortController()

    await RequestService.getInstance().send({
      path: '/test',
      method: 'GET',
      signal: controller.signal,
    })

    expect(adapter.lastOptions?.signal).toBe(controller.signal)
  })

  it('未传 signal 时 adapter 收到 undefined', async () => {
    const adapter = createMockSetup()

    await RequestService.getInstance().send({
      path: '/test',
      method: 'GET',
    })

    expect(adapter.lastOptions?.signal).toBeUndefined()
  })
})
