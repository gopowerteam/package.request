/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUploadTokenResponse } from '../models/GetUploadTokenResponse'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class QiniuService {
  // 请求实例
  private request = RequestService.getInstance()

  public getUploadToken(
    requestPlugins: RequestPlugin[] = []
  ): Promise<GetUploadTokenResponse> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/qiniu/upload-token',
        method: 'get'
      },
      requestPlugins
    )

    return result
  }
}

namespace RequestQueryParams {}
