/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppInitInput } from '../models/AppInitInput'
import type { AppBaseResponse } from '../models/AppBaseResponse'
import type { LoginInput } from '../models/LoginInput'
import type { TokenResponse } from '../models/TokenResponse'
import type { Administrator } from '../models/Administrator'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class AppService {
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
   * 系统初始化
   */
  public appInit(
    requestBody: AppInitInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public appInit(
    requestBody: AppInitInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public appInit(
    requestBody: AppInitInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/app/app-init',
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
   * 获取系统基本信息
   */
  public appBase(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public appBase(
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<AppBaseResponse>
  public appBase(
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<AppBaseResponse> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/app/app-base',
      method: 'get'
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 管理员登录
   */
  public login(
    requestBody: LoginInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public login(
    requestBody: LoginInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<TokenResponse>
  public login(
    requestBody: LoginInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<TokenResponse> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/app/login',
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
   * 刷新Token
   */
  public token(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public token(
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<TokenResponse>
  public token(
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<TokenResponse> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/app/token',
      method: 'get'
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 获取当前用户信息
   */
  public getCurrentAdmin(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getCurrentAdmin(
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator>
  public getCurrentAdmin(
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Administrator> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/app/current',
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
