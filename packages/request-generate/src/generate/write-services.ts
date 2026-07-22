import type { Service } from '../entities/service'
import type { GenerateClient } from '../types/generate-client'
import type { GenerateApplicationOptions } from '../types/generate-options'
import path from 'node:path'
import { Generate } from '.'
import { safeClearGeneratedDir, writeGeneratedMarker } from './safe-clear'
import { writeService } from './write-service'

export function writeServices(
  client: GenerateClient,
  options: GenerateApplicationOptions,
) {
  if (!client.services) {
    return
  }

  // 输出路径
  const output = path.join(options.output, 'services')

  // 安全清空历史文件(仅当目录由本工具生成时才会清空,forceClear 可跳过标记检查)
  const markerPath = safeClearGeneratedDir(output, options.forceClear ?? false)

  // 写入Services
  client.services.forEach((service) => {
    const filename = `${service.name}Service.ts`
    // 构造写入上下文,不修改原始 entity
    const serviceWithContext: Service = {
      ...service,
      application:
        Generate.options.appendService === false ? '' : options.application,
    }

    writeService(serviceWithContext, path.join(output, filename))
  })

  // 写入标记文件,标识目录由本工具生成
  writeGeneratedMarker(markerPath)
}
