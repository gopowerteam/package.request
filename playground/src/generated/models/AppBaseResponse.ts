/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QiniuConfig } from './QiniuConfig'

export type AppBaseResponse = {
  /**
   * 授权Token
   */
  base_time: number
  /**
   * 七牛配置
   */
  qiniu: QiniuConfig
}
