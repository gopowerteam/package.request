/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateProductAttrInput } from './CreateProductAttrInput'
import type { CreateProductSpecInput } from './CreateProductSpecInput'

export type UpdateProductInput = {
  /**
   * 标题
   */
  title?: string
  /**
   * 副标题
   */
  subtitle?: string
  /**
   * 关键字
   */
  keyword?: string[]
  /**
   * 推荐
   */
  recommended?: boolean
  /**
   * Bannner
   */
  banners?: string[]
  /**
   * 封面
   */
  cover?: string
  /**
   * 内容图
   */
  contents?: string[]
  /**
   * 分类
   */
  categoryId?: string
  /**
   * 属性
   */
  attrs?: CreateProductAttrInput[]
  /**
   * 规格项
   */
  specs?: CreateProductSpecInput[]
}
