import type {
  ObservableLike,
  RequestGenerateOptions,
  RequestPlugin,
  RequestSendOptions,
} from './interfaces'
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

  protected generateRequest<R = any>(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[] = [],
    requestGenerateOptions?: RequestGenerateOptions,
  ): string | Promise<R> | ObservableLike<R> {
    switch (true) {
      case requestGenerateOptions?.type === RequestGenerateType.URL:
        // 生成 URL(直接返回字符串,不经数据分支包装)
        return this.request.toURL(requestSendOptions, requestPlugins)
      default:
        // 请求数据(独立方法,供 Observable 子类覆写包装)
        return this.sendData<R>(requestSendOptions, requestPlugins)
    }
  }

  /**
   * 数据请求分支。
   *
   * 返回类型含 ObservableLike<R>:为 Observable 子类覆写
   * (返回 rxjs Observable<R>)提供结构化协变出口,同时避免基类签名
   * 引用 rxjs 类型破坏「promise 模式宿主无需安装 rxjs」不变量。
   * 本基类实现始终返回 Promise<R>。
   */
  protected sendData<R = any>(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[],
  ): Promise<R> | ObservableLike<R> {
    return this.request.send<R>(requestSendOptions, requestPlugins)
  }
}
