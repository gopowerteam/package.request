import type { GenerateClient } from '../types/generate-client'
import type { GenerateApplicationOptions } from '../types/generate-options'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { writeModel } from './write-model'
import rimraf from 'rimraf'
/**
 * 写入Model文件
 * @param client
 * @param options
 * @returns
 */
export function writeModels(
  client: GenerateClient,
  options: GenerateApplicationOptions
) {
  if (!options.exportModels && client.models) {
    return
  }

  // 输出路径
  const output = path.join(options.output, 'models')

  // 清空历史文件
  if (fs.existsSync(output)) {
    rimraf.sync(output)
  }

  // 创建目标文件夹
  fs.mkdirSync(output, { recursive: true })

  // 写入Models
  client.models.forEach((model) => {
    const filename = `${model.name}.ts`
    writeModel(model, path.join(output, filename))
  })
}
