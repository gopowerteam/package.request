import { RequestSetupConfig } from './interfaces/request-setup.interface'
import { RequestService } from './request-service'

export function setup(config: RequestSetupConfig) {
  RequestService.config = config
}
