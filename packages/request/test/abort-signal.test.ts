import type { RequestAdapterOptions } from '../src/interfaces/request-adapter.interface'
import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { AxiosAdapter } from '../src/adapters'
import { AbortService } from '../src/plugins/abort-service'
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

describe('abortService 作用域插件', () => {
  it('before() 应为请求注入 signal', async () => {
    const abortService = new AbortService()
    const options: any = { path: '/x', method: 'GET' }

    await abortService.before(options, () => {})

    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(abortService.size).toBe(1)
  })

  it('after() 应回收已完成请求的 controller', async () => {
    const abortService = new AbortService()
    const options: any = {}
    await abortService.before(options, () => {})

    abortService.after({} as any, options)

    expect(abortService.size).toBe(0)
  })

  it('catch() 应回收失败请求的 controller', async () => {
    const abortService = new AbortService()
    const options: any = {}
    await abortService.before(options, () => {})

    abortService.catch({} as any, options)

    expect(abortService.size).toBe(0)
  })

  it('abort() 应终止所有 in-flight 请求并清空', async () => {
    const abortService = new AbortService()
    const optionsA: any = {}
    const optionsB: any = {}
    await abortService.before(optionsA, () => {})
    await abortService.before(optionsB, () => {})

    abortService.abort()

    expect(optionsA.signal.aborted).toBe(true)
    expect(optionsB.signal.aborted).toBe(true)
    expect(abortService.size).toBe(0)
  })

  it('已回收的请求不受后续 abort() 影响', async () => {
    const abortService = new AbortService()
    const finished: any = {}
    const inflight: any = {}
    await abortService.before(finished, () => {})
    await abortService.before(inflight, () => {})
    abortService.after({} as any, finished)

    abortService.abort()

    expect(finished.signal.aborted).toBe(false)
    expect(inflight.signal.aborted).toBe(true)
  })

  it('连续请求生成独立 controller 互不影响', async () => {
    const abortService = new AbortService()
    const first: any = {}
    const second: any = {}
    await abortService.before(first, () => {})
    await abortService.before(second, () => {})

    abortService.abort()

    expect(first.signal).not.toBe(second.signal)
  })
})

describe('取消请求端到端(离线)', () => {
  function createOfflineSetup() {
    const exceptionResponses: any[] = []
    const config: RequestSetupConfig = {
      gateway: 'http://127.0.0.1:9',
      adapter: new AxiosAdapter(),
      interceptors: {
        status: { exec: () => true },
        success: { exec: r => r },
        error: { exec: r => r },
        exception: { exec: (r) => {
          exceptionResponses.push(r)
          return r
        } },
      },
      plugins: [],
    }
    setup(config)
    return { exceptionResponses }
  }

  it('预终止 signal 应走异常流程并携带 canceled 标记', async () => {
    const { exceptionResponses } = createOfflineSetup()

    const controller = new AbortController()
    controller.abort()

    const rejection = await RequestService.getInstance()
      .send({ path: '/offline', method: 'GET', signal: controller.signal })
      .then(() => null)
      .catch(r => r)

    expect(rejection).not.toBeNull()
    expect(exceptionResponses[0]?.canceled).toBe(true)
  })

  it('abortService 注入的请求 abort 后应携带 canceled 标记', async () => {
    const { exceptionResponses } = createOfflineSetup()

    const abortService = new AbortService()
    const promise = RequestService.getInstance()
      .send({ path: '/offline', method: 'GET' }, [abortService])
      .then(() => null)
      .catch(r => r)

    abortService.abort()

    const rejection = await promise

    expect(rejection).not.toBeNull()
    expect(exceptionResponses[0]?.canceled).toBe(true)
    expect(abortService.size).toBe(0)
  })
})
