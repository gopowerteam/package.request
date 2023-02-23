/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUploadTokenResponse } from '../models/GetUploadTokenResponse'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class QiniuService {
  // 请求实例
  private request = RequestService.getInstance()
  private service = ''

  private generateRequest(
    requestSendOptions: RequestSendOptions,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ) {
    switch (true) {
      case requestGenerateOptions?.type === RequestGenerateType.URL:
        // 生成URL
        return this.request.toURL(requestSendOptions, requestPlugins)
      default: {
        // 请求数据
        const result = this.request.send(requestSendOptions, requestPlugins)

        return result
      }
    }
  }

  public getUploadToken(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getUploadToken(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<GetUploadTokenResponse>
  public getUploadToken(
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<GetUploadTokenResponse> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/qiniu/upload-token',
      method: 'get'
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }
}

namespace RequestQueryParams {}
