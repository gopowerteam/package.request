/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateProductAttrItemInput } from './CreateProductAttrItemInput'

export type CreateProductAttrInput = {
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
  items: CreateProductAttrItemInput[]
}
