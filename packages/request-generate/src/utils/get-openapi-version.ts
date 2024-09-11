import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { OpenAPIVersion } from '../config/enum.config'

/**
 * 获取OpenAPI版本
 * @param document
 * @returns
 */
export function getOpenAPIVersion(
  document: OpenAPIV3.Document & OpenAPIV2.Document,
) {
  const version = document?.swagger || document?.openapi

  if (typeof version === 'string') {
    const v = Number.parseInt(version.charAt(0))
    if (Object.values(OpenAPIVersion).includes(v)) {
      return v as OpenAPIVersion
    }
  }

  throw new Error(`无法识别的OPENAPI版本: "${String(version)}"`)
}
