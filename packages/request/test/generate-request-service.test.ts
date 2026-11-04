import type { RequestSendOptions } from '../src/interfaces'
import type { RequestService } from '../src/request-service'
import { firstValueFrom } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { GenerateRequestService } from '../src/generate-request-service'
import { RequestGenerateType } from '../src/interfaces'
import { ObservableGenerateRequestService } from '../src/observable/generate-request-service'

const sendOptions: RequestSendOptions = { service: 'demo', path: '/users', method: 'get' } as any

// 注意:getInstance() 未缓存实例(每次返回新对象),因此必须先构造 service,
// 再对其内部实际持有的 request 实例打桩
function createService<T extends new () => any>(Ctor: T) {
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
