import { RequestService } from './request-service'
import type { RequestSetupConfig } from './interfaces/request-setup.interface'

export function setup(config: RequestSetupConfig) {
  // 注入全局配置
  RequestService.config = config
  // 注入Adapter配置
  RequestService.config?.adapter?.injectConfig?.(config)
}
