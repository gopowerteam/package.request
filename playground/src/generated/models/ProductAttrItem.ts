/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductAttr } from './ProductAttr'

export type ProductAttrItem = {
  /**
   * ID
   */
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
   * 删除时间
   */
  deletedAt: string
  /**
   * 创建人
   */
  creator: string
  /**
   * 操作人
   */
  operator: string
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
