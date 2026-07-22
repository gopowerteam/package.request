import type { GenerateClient } from '../types/generate-client'
import type { GenerateApplicationOptions } from '../types/generate-options'
import path from 'node:path'
import { safeClearGeneratedDir, writeGeneratedMarker } from './safe-clear'
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

  // 安全清空历史文件(仅当目录由本工具生成时才会清空,forceClear 可跳过标记检查)
  const markerPath = safeClearGeneratedDir(output, options.forceClear ?? false)

  // 写入Models
  client.models.forEach((model) => {
    const filename = `${model.name}.ts`
    writeModel(model, path.join(output, filename))
  })

  // 写入标记文件,标识目录由本工具生成
  writeGeneratedMarker(markerPath)
}
