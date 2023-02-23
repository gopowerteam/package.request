/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Product } from './Product'
import type { ProductAttr } from './ProductAttr'
import type { ProductSpec } from './ProductSpec'

export type ProductVersion = {
  id: string
  /**
   * 创建日期
   */
  createdAt: string
  /**
   * 更新日期
   */
  updatedAt: string
  /**
   * 版本号
   */
  version: number
  /**
   * 关联商品
   */
  product: Product
  /**
   * 关联商品属性
   */
  attrs: ProductAttr[]
  /**
   * 关联商品Spec
   */
  specs: ProductSpec[]
}
