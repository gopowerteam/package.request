/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateBannerInput } from '../models/CreateBannerInput'
import type { Banner } from '../models/Banner'
import type { UpdateBannerInput } from '../models/UpdateBannerInput'
import type { ChangeBannerOrderInput } from '../models/ChangeBannerOrderInput'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class BannerService {
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

  /**
   * 创建Banner
   */
  public createBanner(
    requestBody: CreateBannerInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createBanner(
    requestBody: CreateBannerInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner>
  public createBanner(
    requestBody: CreateBannerInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner',
      method: 'post',
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 查询Banner列表
   */
  public findBanner(
    requestQuery: RequestQueryParams.FindBanner,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findBanner(
    requestQuery: RequestQueryParams.FindBanner,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner[]>
  public findBanner(
    requestQuery: RequestQueryParams.FindBanner,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner',
      method: 'get',
      paramsQuery: requestQuery
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 更新Banner
   */
  public updateBanner(
    id: string,
    requestBody: UpdateBannerInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateBanner(
    id: string,
    requestBody: UpdateBannerInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner>
  public updateBanner(
    id: string,
    requestBody: UpdateBannerInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner/{id}',
      method: 'put',
      paramsPath: {
        id
      },
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 获取Banner
   */
  public getBanner(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getBanner(
    id: string,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner>
  public getBanner(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Banner> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner/{id}',
      method: 'get',
      paramsPath: {
        id
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 删除Banner
   */
  public deleteBanner(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteBanner(
    id: string,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public deleteBanner(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner/{id}',
      method: 'delete',
      paramsPath: {
        id
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 交换Banner位置
   */
  public changeBannerOrder(
    id: string,
    requestBody: ChangeBannerOrderInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public changeBannerOrder(
    id: string,
    requestBody: ChangeBannerOrderInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public changeBannerOrder(
    id: string,
    requestBody: ChangeBannerOrderInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/banner/change-order/{id}',
      method: 'patch',
      paramsPath: {
        id
      },
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }
}

namespace RequestQueryParams {
  export type FindBanner = {
    /**
     * Banner类型
     */
    type?: 'URL' | 'PAGE' | 'PROJECT'
  }
}
