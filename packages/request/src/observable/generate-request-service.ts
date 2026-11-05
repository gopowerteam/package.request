import type { Observable } from 'rxjs'
import type { RequestGenerateOptions, RequestPlugin, RequestSendOptions } from '../interfaces'
import { from } from 'rxjs'
import { GenerateRequestService } from '../generate-request-service'
import { RequestGenerateType } from '../interfaces'

/**
 * 代码生成服务基类(Observable 模式)
 *
 * 与 promise 版 {@link GenerateRequestService} 的唯一差异:
 * 数据请求结果经 rxjs from() 包装为 Observable;
 * URL 模式行为一致(直接返回字符串)。
 *
 * 通过子路径 `@gopowerteam/request/observable` 导出,
 * 避免主入口引入 rxjs 依赖(promise 模式宿主无需安装 rxjs)。
 */
export class ObservableGenerateRequestService extends GenerateRequestService {
  protected override generateRequest<R = any>(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[] = [],
    requestGenerateOptions?: RequestGenerateOptions,
  ): string | Observable<R> {
    if (requestGenerateOptions?.type === RequestGenerateType.URL) {
      return this.request.toURL(requestSendOptions, requestPlugins)
    }

    return this.sendData<R>(requestSendOptions, requestPlugins)
  }

  protected override sendData<R = any>(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[],
  ): Observable<R> {
    // 基类数据分支运行时恒为 Promise,此处断言以适配 from() 的 ObservableInput 形参
    return from(super.sendData<R>(requestSendOptions, requestPlugins) as Promise<R>)
  }
}
