/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateBannerInput } from '../models/CreateBannerInput'
import type { Banner } from '../models/Banner'
import type { UpdateBannerInput } from '../models/UpdateBannerInput'
import type { ChangeBannerOrderInput } from '../models/ChangeBannerOrderInput'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class BannerService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 创建Banner
   */
  public createBanner(
    requestBody: CreateBannerInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Banner> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 查询Banner列表
   */
  public findBanner(
    requestQuery: RequestQueryParams.FindBanner,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Banner[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner',
        method: 'get',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 更新Banner
   */
  public updateBanner(
    id: string,
    requestBody: UpdateBannerInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Banner> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner/{id}',
        method: 'put',
        paramsPath: {
          id
        },
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取Banner
   */
  public getBanner(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Banner> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner/{id}',
        method: 'get',
        paramsPath: {
          id
        }
      },
      requestPlugins
    )

    return result
  }

  /**
   * 删除Banner
   */
  public deleteBanner(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner/{id}',
        method: 'delete',
        paramsPath: {
          id
        }
      },
      requestPlugins
    )

    return result
  }

  /**
   * 交换Banner位置
   */
  public changeBannerOrder(
    id: string,
    requestBody: ChangeBannerOrderInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/banner/change-order/{id}',
        method: 'patch',
        paramsPath: {
          id
        },
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
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
