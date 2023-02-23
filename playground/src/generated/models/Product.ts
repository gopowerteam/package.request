/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from './Category'
import type { ProductVersion } from './ProductVersion'

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
   * 所有商品配置
   */
  versions: ProductVersion[]
  /**
   * 最低价
   */
  minPrice: any
  /**
   * 最高价
   */
  maxPrice: any
  /**
   * 当前商品配置
   */
  property: any
}
