import type { Model } from '../entities/model'

export type GenerateClient = {
  // 模型列表
  models: Model[]
  // 服务列表
  services: Service[]
}
