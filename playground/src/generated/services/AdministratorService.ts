/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAdministratorInput } from '../models/CreateAdministratorInput'
import type { Administrator } from '../models/Administrator'
import type { UpdateAdministratorInput } from '../models/UpdateAdministratorInput'
import type { AdministratorResetPasswordResponse } from '../models/AdministratorResetPasswordResponse'
import type { UpdatePasswordInput } from '../models/UpdatePasswordInput'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class AdministratorService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 创建管理员
   */
  public createAdministrator(
    requestBody: CreateAdministratorInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Administrator> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 查询管理员列表
   */
  public findAdministrator(
    requestQuery: RequestQueryParams.FindAdministrator,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Administrator[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator',
        method: 'get',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 更新管理员
   */
  public updateAdministrator(
    id: string,
    requestBody: UpdateAdministratorInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Administrator> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator/{id}',
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
   * 获取管理员
   */
  public getAdministrator(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Administrator> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator/{id}',
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
   * 删除用户
   */
  public deleteAdministrator(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator/{id}',
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
   * 重置管理员密码
   */
  public resetAdministratorPassword(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<AdministratorResetPasswordResponse> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator/reset-password/{id}',
        method: 'patch',
        paramsPath: {
          id
        }
      },
      requestPlugins
    )

    return result
  }

  /**
   * 更新管理员密码
   */
  public updateAdministratorPassword(
    id: string,
    requestBody: UpdatePasswordInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/administrator/update-password/{id}',
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
  export type FindAdministrator = {
    /**
     * 姓名(模糊查询)
     */
    realname?: string
    /**
     * 用户名(模糊查询)
     */
    username?: string
  }
}
