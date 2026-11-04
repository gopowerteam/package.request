import type { RequestSendOptions } from '../src/interfaces'
import { firstValueFrom } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GenerateRequestService } from '../src/generate-request-service'
import { RequestGenerateType } from '../src/interfaces'
import { ObservableGenerateRequestService } from '../src/observable/generate-request-service'
import { RequestService } from '../src/request-service'

const sendOptions: RequestSendOptions = { service: 'demo', path: '/users', method: 'get' } as any

afterEach(() => {
  vi.restoreAllMocks()
})

// getInstance() 已缓存单例:先重置单例再构造 service,
// 保证每个用例拿到干净的 request 实例,避免用例间相互影响
function createService<T extends new () => any>(Ctor: T) {
  ;(RequestService as any).instance = undefined
  const service = new Ctor()
  const request = (service as any).request as RequestService
  return { service, request }
}

describe('generateRequestService - 代码生成基类(promise 模式)', () => {
  it('uRL 模式应返回 toURL 字符串且不调用 send', async () => {
    const { service, request } = createService(GenerateRequestService)
    const toURLSpy = vi.spyOn(request, 'toURL').mockReturnValue('http://gw/users')
    const sendSpy = vi.spyOn(request, 'send').mockResolvedValue({})

    const result = await (service as any).generateRequest(sendOptions, [], { type: RequestGenerateType.URL })

    expect(result).toBe('http://gw/users')
    expect(toURLSpy).toHaveBeenCalledOnce()
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('数据模式应返回 send 结果且不调用 toURL', async () => {
    const { service, request } = createService(GenerateRequestService)
    const toURLSpy = vi.spyOn(request, 'toURL').mockReturnValue('http://gw/users')
    const sendSpy = vi.spyOn(request, 'send').mockResolvedValue({ id: 1 })

    const result = await (service as any).generateRequest(sendOptions, [])

    expect(result).toEqual({ id: 1 })
    expect(sendSpy).toHaveBeenCalledOnce()
    expect(toURLSpy).not.toHaveBeenCalled()
  })
})

describe('observableGenerateRequestService - 代码生成基类(observable 模式)', () => {
  it('数据模式应返回 Observable 且取值为 send 结果的 from 包装', async () => {
    const { service, request } = createService(ObservableGenerateRequestService)
    vi.spyOn(request, 'send').mockResolvedValue({ id: 2 })

    const result = (service as any).generateRequest(sendOptions, [])

    // 应为 rxjs Observable(具有 subscribe 方法)而非裸 Promise
    expect(typeof result.subscribe).toBe('function')
    await expect(firstValueFrom(result)).resolves.toEqual({ id: 2 })
  })

  it('uRL 模式应原样返回 toURL 字符串(不被 from 包装为逐字符流)', async () => {
    const { service, request } = createService(ObservableGenerateRequestService)
    vi.spyOn(request, 'toURL').mockReturnValue('http://gw/users')

    const result = (service as any).generateRequest(sendOptions, [], { type: RequestGenerateType.URL })

    expect(result).toBe('http://gw/users')
    expect(typeof result.subscribe).not.toBe('function')
  })
})
