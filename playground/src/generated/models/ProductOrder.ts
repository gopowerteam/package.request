/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductOrderItem } from './ProductOrderItem'
import type { PaymentOrder } from './PaymentOrder'

export type ProductOrder = {
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
   * 商品订单状态
   */
  state:
    | 'PENDING'
    | 'PROCESSING'
    | 'FINISHED'
    | 'EXPIRED'
    | 'REFUNDED'
    | 'CLOSED'
  /**
   * 所属商品
   */
  items: ProductOrderItem[]
  /**
   * 订单金额
   */
  price: number
  /**
   * 支付订单
   */
  paymentOrder: PaymentOrder
}
