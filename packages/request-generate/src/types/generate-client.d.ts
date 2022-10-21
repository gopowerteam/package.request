import type { Model } from '../entities/model'
import type { Service } from '../entities/service'

export type GenerateClient = {
  // 模型列表
  models: Model[]
  // 服务列表
  services: Service[]
}
