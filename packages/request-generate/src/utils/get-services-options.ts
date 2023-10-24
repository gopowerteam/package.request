import path from 'node:path'
import type {
  ApplicationConfig,
  GenerateApplicationOptions,
  GenerateOptions
} from '../types/generate-options'

/**
 * 创建单服务配置项
 * @param options
 * @param name
 * @param service
 * @returns
 */
function createOptions(
  options: GenerateOptions,
  name?: string,
  application?: ApplicationConfig
) {
  const { service, openapi } = (() => {
    if (!application) {
      return {
        service: '',
        openapi: options.openapi
      }
    }
    if (typeof application === 'string') {
      return {
        service: application,
        openapi: options.openapi
      }
    } else {
      return {
        service: application.key,
        openapi: application.openapi
      }
    }
  })()

  return {
    name,
    application: service,
    input: `${options.gateway}/${service}/${openapi}`.replace(/\/{2,3}/g, '/'),
    output: name ? path.join(options.output, name) : options.output,
    exportModels: options.exportModels
  }
}

/**
 * 创建服务项
 * @param options
 * @returns
 */
export function generateServiceOptions(
  options: GenerateOptions
): GenerateApplicationOptions[] {
  if (options.applications && Object.keys(options.applications).length) {
    return Object.entries(options.applications).map(([name, application]) =>
      createOptions(options, name, application)
    )
  } else {
    return [createOptions(options)]
  }
}
