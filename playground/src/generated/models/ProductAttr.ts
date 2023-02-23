/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductVersion } from './ProductVersion'
import type { ProductAttrItem } from './ProductAttrItem'

export type ProductAttr = {
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
   * 属性名称
   */
  name: string
  /**
   * 是否是主属性
   */
  primary: boolean
  /**
   * 所属商品版本
   */
  version: ProductVersion
  /**
   * 属性项
   */
  items: ProductAttrItem[]
}
