import type { GenerateClient } from '../types/generate-client'
import type { GenerateApplicationOptions } from '../types/generate-options'
import * as path from 'node:path'
import * as fs from 'node:fs'
import rimraf from 'rimraf'
import { writeService } from './write-service'
import { Generate } from '.'

export function writeServices(
  client: GenerateClient,
  options: GenerateApplicationOptions
) {
  if (!client.services) {
    return
  }

  // 输出路径
  const output = path.join(options.output, 'services')

  // 清空历史文件
  if (fs.existsSync(output)) {
    rimraf.sync(output)
  }

  // 创建目标文件夹
  fs.mkdirSync(output, { recursive: true })

  // 写入Services
  client.services.forEach((service) => {
    const filename = `${service.name}Service.ts`
    // 设置应用名称
    service.application =
      Generate.options.appendService === false ? '' : options.application

    writeService(service, path.join(output, filename))
  })
}
