/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAdministratorInput } from '../models/CreateAdministratorInput'
import type { Administrator } from '../models/Administrator'
import type { PageAdministrator } from '../models/PageAdministrator'
import type { UpdateAdministratorInput } from '../models/UpdateAdministratorInput'
import type { AdministratorResetPasswordResponse } from '../models/AdministratorResetPasswordResponse'
import type { UpdatePasswordInput } from '../models/UpdatePasswordInput'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class AdministratorService {
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
   * 创建管理员
   */
  public createAdministrator(
    requestBody: CreateAdministratorInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createAdministrator(
    requestBody: CreateAdministratorInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator>
  public createAdministrator(
    requestBody: CreateAdministratorInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator',
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
   * 查询管理员列表
   */
  public findAdministrator(
    requestQuery: RequestQueryParams.FindAdministrator,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findAdministrator(
    requestQuery: RequestQueryParams.FindAdministrator,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PageAdministrator>
  public findAdministrator(
    requestQuery: RequestQueryParams.FindAdministrator,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PageAdministrator> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator',
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
   * 更新管理员
   */
  public updateAdministrator(
    id: string,
    requestBody: UpdateAdministratorInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateAdministrator(
    id: string,
    requestBody: UpdateAdministratorInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator>
  public updateAdministrator(
    id: string,
    requestBody: UpdateAdministratorInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator/{id}',
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
   * 获取管理员
   */
  public getAdministrator(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getAdministrator(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator>
  public getAdministrator(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator/{id}',
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
   * 删除用户
   */
  public deleteAdministrator(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteAdministrator(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public deleteAdministrator(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator/{id}',
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
   * 重置管理员密码
   */
  public resetAdministratorPassword(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public resetAdministratorPassword(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<AdministratorResetPasswordResponse>
  public resetAdministratorPassword(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<AdministratorResetPasswordResponse> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator/reset-password/{id}',
      method: 'patch',
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
   * 更新管理员密码
   */
  public updateAdministratorPassword(
    id: string,
    requestBody: UpdatePasswordInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateAdministratorPassword(
    id: string,
    requestBody: UpdatePasswordInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public updateAdministratorPassword(
    id: string,
    requestBody: UpdatePasswordInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/administrator/update-password/{id}',
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
