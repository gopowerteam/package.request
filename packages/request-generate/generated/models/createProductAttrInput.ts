/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { createProductAttrItemInput } from './createProductAttrItemInput'

export type createProductAttrInput = {
  /**
   * 属性名称
   */
  name: string
  /**
   * 是否是主属性
   */
  primary: boolean
  /**
   * 属性项
   */
  items: createProductAttrItemInput[]
}
