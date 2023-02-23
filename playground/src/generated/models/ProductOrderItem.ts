/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrder } from './ProductOrder'
import type { ProductSpec } from './ProductSpec'

export type ProductOrderItem = {
  id: string
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
