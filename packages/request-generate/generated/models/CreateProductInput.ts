/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { createProductAttrInput } from './createProductAttrInput'
import type { createProductSpecInput } from './createProductSpecInput'

export type CreateProductInput = {
  /**
   * 标题
   */
  title: string
  /**
   * 副标题
   */
  subtitle: string
  /**
   * 关键字
   */
  keyword: string[]
  /**
   * 推荐
   */
  recommended: boolean
  /**
   * Bannner
   */
  banners: string[]
  /**
   * 封面
   */
  cover: string
  /**
   * 内容图
   */
  contents: string[]
  /**
   * 分类
   */
  categoryId: string
  /**
   * 属性
   */
  attrs: createProductAttrInput[]
  /**
   * 规格项
   */
  specs: createProductSpecInput[]
}
