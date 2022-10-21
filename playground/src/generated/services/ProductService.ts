/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Product } from '../models/Product'
import type { CreateProductInput } from '../models/CreateProductInput'
import type { UpdateProductInput } from '../models/UpdateProductInput'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class ProductService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 查询商品
   */
  public findProduct(
    requestQuery: RequestQueryParams.FindProduct,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Product[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/product',
        method: 'get',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 创建商品
   */
  public createProduct(
    requestBody: CreateProductInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Product> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/product',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取商品
   */
  public getProduct(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Product> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/product/{id}',
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
   * 更新商品
   */
  public updateProduct(
    id: string,
    requestBody: UpdateProductInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Product> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/product/{id}',
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
   * 删除商品
   */
  public deleteProduct(
    id: string,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/product/{id}',
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
  export type FindProduct = {
    /**
     * 标题
     */
    title?: string
    /**
     * 分类
     */
    category?: string
    /**
     * 是否推荐
     */
    recommended?: boolean
  }
}
