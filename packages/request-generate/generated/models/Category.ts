/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Category = {
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
   * 排序
   */
  sort: number
  /**
   * 标题
   */
  title: string
  /**
   * 图片
   */
  image: string
  /**
   * 推荐
   */
  recommended: boolean
  /**
   * 父节点
   */
  parent: Category
  /**
   * 子节点
   */
  children: Category[]
}
