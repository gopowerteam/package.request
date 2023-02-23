/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubmitOrderInput } from '../models/SubmitOrderInput'
import type { ProductOrder } from '../models/ProductOrder'
import type { PaymentOrder } from '../models/PaymentOrder'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class OrderService {
  // 请求实例
  private request = RequestService.getInstance()
  private service = ''

  private generateRequest(
    requestSendOptions: RequestSendOptions,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ) {
    switch (true) {
      case requestGenerateOptions?.type === RequestGenerateType.URL:
        // 生成URL
        return this.request.toURL(requestSendOptions, requestPlugins)
      default: {
        // 请求数据
        const result = this.request.send(requestSendOptions, requestPlugins)

        return result
      }
    }
  }

  /**
   * 提交订单
   */
  public submitOrder(
    requestBody: SubmitOrderInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public submitOrder(
    requestBody: SubmitOrderInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder>
  public submitOrder(
    requestBody: SubmitOrderInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/order/submit',
      method: 'post',
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 支付订单
   */
  public paymentOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public paymentOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PaymentOrder>
  public paymentOrder(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<PaymentOrder> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/order/payment/{id}',
      method: 'post',
      paramsPath: {
        id
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 取消订单
   */
  public cancelOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public cancelOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder>
  public cancelOrder(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/order/cancel/{id}',
      method: 'put',
      paramsPath: {
        id
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 删除订单
   */
  public deleteOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteOrder(
    id: string,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder>
  public deleteOrder(
    id: string,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<ProductOrder> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/order/{id}',
      method: 'delete',
      paramsPath: {
        id
      }
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }
}

namespace RequestQueryParams {}
