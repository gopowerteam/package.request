/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateCategoryInput = {
  /**
   * 标题
   */
  title: string
  /**
   * 分类图片
   */
  image?: string
  /**
   * 是否推荐
   */
  recommended: boolean
  /**
   * 父ID
   */
  parentId?: string
}
