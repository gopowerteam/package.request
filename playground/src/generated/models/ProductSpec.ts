/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVersion } from './ProductVersion'
import type { ProductAttrItem } from './ProductAttrItem'

export type ProductSpec = {
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
   * 删除
   */
  version: ProductVersion
  /**
   * 属性项组合
   */
  items: ProductAttrItem[]
  price?: number
}
