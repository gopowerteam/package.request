/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from './Category'

export type Product = {
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
  category: Category
  /**
   * 属性
   */
  attrs: string[]
  /**
   * 规格项
   */
  specs: string[]
  /**
   * 最低价
   */
  minPrice: any
  /**
   * 最高价
   */
  maxPrice: any
}
