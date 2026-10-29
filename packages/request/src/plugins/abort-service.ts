import type { AdapterResponse } from '../interfaces/request-adapter.interface'
import type { RequestPlugin } from '../interfaces/request-plugin.interface'
import type { RequestSendOptions } from '../interfaces/request-send.interface'

/**
 * 请求终止插件
 * 每个实例为一个取消作用域,abort() 会终止该实例发起的所有进行中请求
 */
export class AbortService implements RequestPlugin {
  private controllers = new Set<AbortController>()

  /**
   * 获取进行中的请求数量
   */
  public get size(): number {
    return this.controllers.size
  }

  /**
   * 为请求注入 signal
   */
  public async before(
    options: RequestSendOptions,
    _appendParams?: (params: Record<string, any>) => void,
  ): Promise<void> {
    const controller = new AbortController()
    this.controllers.add(controller)
    options.signal = controller.signal
  }

  /**
   * 回收已完成请求的 controller
   */
  public after(_response: AdapterResponse, options: RequestSendOptions): void {
    this.dispose(options.signal)
  }

  /**
   * 回收失败请求的 controller
   */
  public catch(_response: AdapterResponse, options: RequestSendOptions): void {
    this.dispose(options.signal)
  }

  /**
   * 终止所有进行中的请求
   */
  public abort(): void {
    this.controllers.forEach(controller => controller.abort())
    this.controllers.clear()
  }

  /**
   * 按 signal 回收对应 controller
   */
  private dispose(signal?: AbortSignal): void {
    if (!signal) {
      return
    }

    for (const controller of this.controllers) {
      if (controller.signal === signal) {
        this.controllers.delete(controller)
        break
      }
    }
  }
}
