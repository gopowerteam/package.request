import type {
  ApplicationConfig,
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'
import path from 'node:path'
import process from 'node:process'

/**
 * 创建单服务配置项
 * @param options
 * @param name
 * @param application
 */
function createOptions(
  options: GenerateOptions,
  name?: string,
  application?: ApplicationConfig,
) {
  const { service, openapi } = (() => {
    if (!application) {
      return {
        service: '',
        openapi: options.openapi,
      }
    }
    if (typeof application === 'string') {
      return {
        service: application,
        openapi: options.openapi,
      }
    }
    else {
      return {
        service: application.key,
        openapi: application.openapi,
      }
    }
  })()
  const baseDir = options.baseDir ?? process.cwd()

  return {
    name,
    application: service,
    input: `${options.gateway}/${service}/${openapi}`.replace(/\/{2,3}/g, '/'),
    // output 单点收敛:统一按 baseDir 解析为绝对路径,下游(write-models/services、账本检查)直接可用
    output: path.resolve(baseDir, name
      ? path.join(options.output, name)
      : options.output),
    baseDir,
    exportModels: options.exportModels,
    forceClear: options.forceClear,
  }
}

/**
 * 创建服务项
 * @param options
 * @returns GenerateApplicationOptions[]
 */
export function generateServiceOptions(
  options: GenerateOptions,
): GenerateApplicationOptions[] {
  if (options.applications && Object.keys(options.applications).length) {
    return Object.entries(options.applications).map(([name, application]) =>
      createOptions(options, name, application),
    )
  }
  else {
    return [
      createOptions(options, 'default'),
    ]
  }
}
