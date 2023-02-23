/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCategoryInput } from '../models/CreateCategoryInput'
import type { Category } from '../models/Category'
import type { UpdateCategoryInput } from '../models/UpdateCategoryInput'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class CategoryService {
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
   * 创建分类
   */
  public createCategory(
    requestBody: CreateCategoryInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createCategory(
    requestBody: CreateCategoryInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category>
  public createCategory(
    requestBody: CreateCategoryInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/category',
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
   * 查询分类
   */
  public findCategory(
    requestQuery: RequestQueryParams.FindCategory,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findCategory(
    requestQuery: RequestQueryParams.FindCategory,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category[]>
  public findCategory(
    requestQuery: RequestQueryParams.FindCategory,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/category',
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
   * 更新分类
   */
  public updateCategory(
    id: string,
    requestBody: UpdateCategoryInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateCategory(
    id: string,
    requestBody: UpdateCategoryInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category>
  public updateCategory(
    id: string,
    requestBody: UpdateCategoryInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/category/{id}',
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
   * 获取分类
   */
  public getCategory(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getCategory(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category>
  public getCategory(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Category> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/category/{id}',
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
   * 删除分类
   */
  public deleteCategory(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteCategory(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public deleteCategory(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/category/{id}',
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
}

namespace RequestQueryParams {
  export type FindCategory = {
    /**
     * 标题
     */
    title?: string
    /**
     * 是否推荐
     */
    recommended?: boolean
    /**
     * 是否包含子元素
     */
    recursion?: boolean
  }
}
