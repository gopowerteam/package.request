/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductAttr } from './ProductAttr'

export type ProductAttrItem = {
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
   * 属性项名称
   */
  name: string
  /**
   * 图片
   */
  image: string
  /**
   * 所属属性
   */
  attr: ProductAttr
}
