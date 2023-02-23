import { RequestSetupConfig } from './interfaces/request-setup.interface'
import { RequestService } from './request-service'

export function setup(config: RequestSetupConfig) {
  // 注入全局配置
  RequestService.config = config
  // 注入Adapter配置
  RequestService.config?.adapter?.injectConfig?.(config)
}
