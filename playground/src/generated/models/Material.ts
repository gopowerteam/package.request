/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Material = {
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
   * 素材Key
   */
  key: string
  /**
   * 素材类型
   */
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER'
  /**
   * 来源
   */
  origin: 'admin' | 'weapp'
  /**
   * 分组
   */
  group: 'admin' | 'weapp'
}
