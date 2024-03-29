/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrder } from './ProductOrder'
import type { ProductSpec } from './ProductSpec'

export type ProductOrderItem = {
  /**
   * ID
   */
  id: string
  /**
   * 创建人
   */
  creator: string
  /**
   * 操作人
   */
  operator: string
  /**
   * 标题
   */
  productTitle: string
  /**
   * 商品单价
   */
  unitPrice: number
  /**
   * 商品总价
   */
  totalPrice: number
  /**
   * 购买数量
   */
  count: number
  /**
   * 商品订单
   */
  productOrder: ProductOrder
  /**
   * 商品Spec
   */
  productSpec: ProductSpec
}
