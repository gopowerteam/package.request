/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaterialGroup } from './MaterialGroup'

export type Material = {
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
  origin: 'admin' | 'weapp' | 'app'
  /**
   * 分组
   */
  group: MaterialGroup
}
