import { OpenAPIVersion } from '../config/enum.config'
import { Model } from './model'
import { Service } from './service'

export type generateClient = {
  name?: string
  version: OpenAPIVersion
  models: Model[]
  services: Service[]
}
