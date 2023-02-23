/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageProduct } from '../models/PageProduct'
import type { CreateProductInput } from '../models/CreateProductInput'
import type { Product } from '../models/Product'
import type { UpdateProductInput } from '../models/UpdateProductInput'
import type { ProductVersion } from '../models/ProductVersion'
import type { SetupProductAttrsInput } from '../models/SetupProductAttrsInput'
import type { ProductAttr } from '../models/ProductAttr'
import type { SetupProductAttrItemsInput } from '../models/SetupProductAttrItemsInput'
import type { ProductSpec } from '../models/ProductSpec'
import type { SetupProductSpecsInput } from '../models/SetupProductSpecsInput'
import type { UpdateProductAttrInput } from '../models/UpdateProductAttrInput'
import type { UpdateProductAttrItemInput } from '../models/UpdateProductAttrItemInput'
import type { ProductAttrItem } from '../models/ProductAttrItem'
import type { UpdateProductSpecInput } from '../models/UpdateProductSpecInput'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class ProductService {
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
   * 查询商品
   */
  public findProduct(
    requestQuery: RequestQueryParams.FindProduct,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findProduct(
    requestQuery: RequestQueryParams.FindProduct,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PageProduct>
  public findProduct(
    requestQuery: RequestQueryParams.FindProduct,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PageProduct> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product',
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
   * 创建商品
   */
  public createProduct(
    requestBody: CreateProductInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createProduct(
    requestBody: CreateProductInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product>
  public createProduct(
    requestBody: CreateProductInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product',
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
   * 获取商品
   */
  public getProduct(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getProduct(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product>
  public getProduct(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}',
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
   * 更新商品
   */
  public updateProduct(
    id: string,
    requestBody: UpdateProductInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateProduct(
    id: string,
    requestBody: UpdateProductInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product>
  public updateProduct(
    id: string,
    requestBody: UpdateProductInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}',
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
   * 获取商品所有版本
   */
  public findVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion[]>
  public findVersion(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}/version',
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
   * 创建商品配置版本
   */
  public createProductVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createProductVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion>
  public createProductVersion(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}/version',
      method: 'post',
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
   * 获取商品指定版本
   */
  public getVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public getVersion(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion>
  public getVersion(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductVersion> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/version/{id}',
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
   * 上架商品
   */
  public publishProduct(
    id: string,
    versionId: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public publishProduct(
    id: string,
    versionId: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product>
  public publishProduct(
    id: string,
    versionId: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/publish/{id}/{versionId}',
      method: 'put',
      paramsPath: {
        id,
        versionId
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 下架商品
   */
  public unpublishProduct(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public unpublishProduct(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product>
  public unpublishProduct(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Product> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/unpublish/{id}',
      method: 'put',
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
   * 配置商品属性项
   */
  public setupProductAttrs(
    id: string,
    requestBody: SetupProductAttrsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public setupProductAttrs(
    id: string,
    requestBody: SetupProductAttrsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttr[]>
  public setupProductAttrs(
    id: string,
    requestBody: SetupProductAttrsInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttr[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}/product-attrs',
      method: 'post',
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
   * 配置商品属性项
   */
  public setupProductAttrItems(
    id: string,
    requestBody: SetupProductAttrItemsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public setupProductAttrItems(
    id: string,
    requestBody: SetupProductAttrItemsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec[]>
  public setupProductAttrItems(
    id: string,
    requestBody: SetupProductAttrItemsInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}/product-attr-items',
      method: 'post',
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
   * 配置商品Specs
   */
  public setupProductSpecs(
    requestBody: SetupProductSpecsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public setupProductSpecs(
    requestBody: SetupProductSpecsInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec[]>
  public setupProductSpecs(
    requestBody: SetupProductSpecsInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/{id}/product-specs',
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
   * 更新商品属性
   */
  public updateProductAttr(
    id: string,
    requestBody: UpdateProductAttrInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateProductAttr(
    id: string,
    requestBody: UpdateProductAttrInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttr>
  public updateProductAttr(
    id: string,
    requestBody: UpdateProductAttrInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttr> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/product-attr/{id}',
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
   * 更新商品属性项
   */
  public updateProductAttrItem(
    id: string,
    requestBody: UpdateProductAttrItemInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateProductAttrItem(
    id: string,
    requestBody: UpdateProductAttrItemInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttrItem>
  public updateProductAttrItem(
    id: string,
    requestBody: UpdateProductAttrItemInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductAttrItem> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/product-attr-item/{id}',
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
   * 更新商品Spec
   */
  public updateProductSpec(
    id: string,
    requestBody: UpdateProductSpecInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateProductSpec(
    id: string,
    requestBody: UpdateProductSpecInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec>
  public updateProductSpec(
    id: string,
    requestBody: UpdateProductSpecInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductSpec> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/product/product-spec/{id}',
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
