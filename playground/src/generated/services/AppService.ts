/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppInitInput } from '../models/AppInitInput'
import type { AppBaseResponse } from '../models/AppBaseResponse'
import type { LoginInput } from '../models/LoginInput'
import type { TokenResponse } from '../models/TokenResponse'
import type { Administrator } from '../models/Administrator'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class AppService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 系统初始化
   */
  public appInit(
    requestBody: AppInitInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/app/app-init',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取系统基本信息
   */
  public appBase(
    requestPlugins: RequestPlugin[] = []
  ): Promise<AppBaseResponse> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/app/app-base',
        method: 'get'
      },
      requestPlugins
    )

    return result
  }

  /**
   * 管理员登录
   */
  public login(
    requestBody: LoginInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<TokenResponse> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/app/login',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 刷新Token
   */
  public token(requestPlugins: RequestPlugin[] = []): Promise<TokenResponse> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/app/token',
        method: 'get'
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取当前用户信息
   */
  public getCurrentAdmin(
    requestPlugins: RequestPlugin[] = []
  ): Promise<Administrator> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/app/current',
        method: 'get'
      },
      requestPlugins
    )

    return result
  }
}

namespace RequestQueryParams {}
