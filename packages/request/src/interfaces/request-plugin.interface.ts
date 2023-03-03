import { AdapterResponse } from './request-adapter.interface'
import { RequestSendOptions } from './request-send.interface'

/**
 * 请求插件
 */
export interface RequestPlugin {
  before?: (
    options: RequestSendOptions,
    appendParams: (params: Record<string, any>) => void
  ) => void

  after?: (response: AdapterResponse, options: RequestSendOptions) => void

  catch?: (response: AdapterResponse, options: RequestSendOptions) => void
}

export enum PluginLifecycle {
  before = 'before',
  after = 'after',
  catch = 'catch'
}

export type RequestLifecycle = PluginLifecycle.before
export type ResponseLifecycle = PluginLifecycle.after | PluginLifecycle.catch
