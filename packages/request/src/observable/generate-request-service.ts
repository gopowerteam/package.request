import type { Observable } from 'rxjs'
import type { RequestGenerateOptions, RequestPlugin, RequestSendOptions } from '../interfaces'
import { from } from 'rxjs'
import { GenerateRequestService } from '../generate-request-service'

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
  protected override generateRequest(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[] = [],
    requestGenerateOptions?: RequestGenerateOptions,
  ): string | Observable<any> {
    return super.generateRequest(requestSendOptions, requestPlugins, requestGenerateOptions)
  }

  protected override sendData(
    requestSendOptions: RequestSendOptions,
    requestPlugins: (RequestPlugin | undefined)[],
  ): Observable<any> {
    return from(super.sendData(requestSendOptions, requestPlugins))
  }
}
