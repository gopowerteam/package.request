/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCategoryInput } from '../models/CreateCategoryInput'
import type { Category } from '../models/Category'
import type { UpdateCategoryInput } from '../models/UpdateCategoryInput'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class CategoryService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 创建分类
   */
  public createCategory(
    requestBody: CreateCategoryInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Category> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/category',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 查询分类
   */
  public findCategory(
    requestQuery: RequestQueryParams.FindCategory,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Category[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/category',
        method: 'get',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 更新分类
   */
  public updateCategory(
    id: string,
    requestBody: UpdateCategoryInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Category> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/category/{id}',
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
   * 获取分类
   */
  public getCategory(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Category> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/category/{id}',
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
   * 删除分类
   */
  public deleteCategory(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/category/{id}',
        method: 'delete',
        paramsPath: {
          id
        }
      },
      requestPlugins
    )

    return result
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
