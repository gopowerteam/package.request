/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrder } from './ProductOrder'

export type PaymentOrder = {
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
   * 商品订单
   */
  productOrder: ProductOrder
  /**
   * 订单金额
   */
  price: number
  /**
   * 支付订单状态
   */
  state: 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED'
}
