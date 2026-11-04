import type { RequestGenerateOptions, RequestPlugin, RequestSendOptions } from './interfaces'
import { RequestGenerateType } from './interfaces'
import { RequestService } from './request-service'

/**
 * 代码生成服务基类(promise 模式)
 *
 * 封装生成代码共用的请求分发逻辑:URL 生成与数据请求。
 * Observable 模式请使用 `@gopowerteam/request/observable` 的
 * `ObservableGenerateRequestService`(数据分支经 rxjs from() 包装)。
 */
export class GenerateRequestService {
  // 请求实例
  protected request = RequestService.getInstance()

  protected generateRequest(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[] = [],
    requestGenerateOptions?: RequestGenerateOptions,
  ): string | Promise<any> | any {
    switch (true) {
      case requestGenerateOptions?.type === RequestGenerateType.URL:
        // 生成 URL(直接返回字符串,不经数据分支包装)
        return this.request.toURL(requestSendOptions, requestPlugins)
      default:
        // 请求数据(独立方法,供 Observable 子类覆写包装)
        return this.sendData(requestSendOptions, requestPlugins)
    }
  }

  /**
   * 数据请求分支。
   * 返回类型含 any:Observable 子类覆写后返回 rxjs Observable,
   * TS 覆写协变要求基类声明兼容子类返回,此处以 any 收敛(运行时行为见子类)。
   */
  protected sendData(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[],
  ): Promise<any> | any {
    return this.request.send(requestSendOptions, requestPlugins)
  }
}
