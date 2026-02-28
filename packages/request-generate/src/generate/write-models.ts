import type { GenerateClient } from '../types/generate-client'
import type { GenerateApplicationOptions } from '../types/generate-options'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { updateProgress } from '../progress'
import { writeModel } from './write-model'

/**
 * 写入Model文件
 * @param client
 * @param options
 */
export function writeModels(
  client: GenerateClient,
  options: GenerateApplicationOptions,
) {
  if (!options.exportModels || !client.models) {
    return
  }

  // 输出路径
  const output = path.join(options.output, 'models')

  // 清空历史文件
  if (fs.existsSync(output)) {
    fs.rmSync(output, { recursive: true, force: true })
  }

  // 创建目标文件夹
  fs.mkdirSync(output, { recursive: true })

  // 写入Models
  client.models.forEach((model) => {
    const filename = `${model.name}.ts`
    writeModel(model, path.join(output, filename))
    updateProgress(options.name || 'default', 'model')
  })
}
