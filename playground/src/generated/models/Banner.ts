/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Banner = {
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
   * title
   */
  title: string
  /**
   * Banner图片
   */
  image: string
  /**
   * Banner类型
   */
  type: 'URL' | 'PAGE' | 'PROJECT'
  /**
   * 参数
   */
  target: string
}
