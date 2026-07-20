import type { GenerateOptions } from '../src/types/generate-options'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 候选的配置文件名(按优先级)
 */
const DEFAULT_CONFIG_FILE_PATHS = [
  'request.config.ts',
  'request-generate.config.cjs',
  'request-generate.config.mjs',
  'request-generate.config.js',
]

/**
 * 支持的配置文件扩展名
 */
const SUPPORTED_EXTENSIONS = ['.ts', '.js', '.cjs', '.mjs']

/**
 * 加载 request-generate 配置文件
 *
 * @param filePath 通过 --config 指定的路径(可选)
 * @returns 配置对象
 */
export async function loadConfigFile(
  filePath?: string,
): Promise<{ default: GenerateOptions }> {
  const candidates = filePath
    ? [filePath, ...DEFAULT_CONFIG_FILE_PATHS]
    : DEFAULT_CONFIG_FILE_PATHS

  const configFilePath = candidates.find(file =>
    fs.existsSync(path.resolve(process.cwd(), file)),
  )

  if (!configFilePath) {
    throw new Error(
      `未找到 request-generate 配置文件,已尝试: ${candidates.join(', ')}`,
    )
  }

  const ext = path.extname(configFilePath)
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `不支持的配置文件类型 "${ext}",仅支持: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    )
  }

  return import(`file://${path.resolve(process.cwd(), configFilePath)}`)
}
