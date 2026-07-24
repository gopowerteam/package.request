import type { GenerateOptions } from './types/generate-options'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'

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
 * 支持的 TS 配置文件扩展名(通过 tsx 的 tsImport 加载)
 */
const TS_EXTENSIONS = ['.ts', '.mts', '.cts']

/**
 * 支持的 JS 配置文件扩展名(通过原生 import 加载)
 */
const JS_EXTENSIONS = ['.js', '.mjs', '.cjs']

/**
 * 支持的配置文件扩展名
 */
const SUPPORTED_EXTENSIONS = [...TS_EXTENSIONS, ...JS_EXTENSIONS]

/**
 * 动态加载配置后的模块命名空间形状
 *
 * - 原生 import(ESM/CJS):结果为 `{ default: 配置对象 }`
 * - tsx 的 tsImport 将 .ts 编译为 CJS 时:结果多包一层 `{ default: { __esModule, default: 配置对象 } }`
 */
interface ConfigModule {
  'default'?: unknown
  '__esModule'?: boolean
  'module.exports'?: unknown
}

/**
 * 加载 request-generate 配置文件
 *
 * 通过 tsx 的 tsImport 加载 .ts/.mts/.cts 配置,使其在普通 Node 进程(如 Vite 插件)中也能工作;
 * .js/.mjs/.cjs 则直接使用原生 import。
 *
 * @param filePath 通过 --config 指定的路径(可选)
 * @param cwd 解析配置文件的基准目录(默认 process.cwd())
 * @returns `{ default: 配置对象 }`,配置对象统一位于 default 字段
 */
export async function loadConfigFile(
  filePath?: string,
  cwd = process.cwd(),
): Promise<{ default: GenerateOptions }> {
  const candidates = filePath
    ? [filePath, ...DEFAULT_CONFIG_FILE_PATHS]
    : DEFAULT_CONFIG_FILE_PATHS

  const configFilePath = candidates.find(file =>
    fs.existsSync(path.resolve(cwd, file)),
  )

  if (!configFilePath) {
    throw new Error(
      `未找到 request-generate 配置文件 (查找目录: ${cwd}),已尝试: ${candidates.join(', ')}`,
    )
  }

  const ext = path.extname(configFilePath)
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `不支持的配置文件类型 "${ext}",仅支持: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    )
  }

  const absolutePath = path.resolve(cwd, configFilePath)
  const fileUrl = pathToFileURL(absolutePath).href

  // .ts/.mts/.cts 需通过 tsx 的 tsImport 加载(兼容普通 Node 进程,如 Vite 插件)
  const mod = (TS_EXTENSIONS.includes(ext)
    ? await tsImport(fileUrl, { parentURL: import.meta.url })
    : await import(fileUrl)) as ConfigModule

  return { default: resolveConfigDefault(mod) }
}

/**
 * 解包配置模块的默认导出,抹平原生 import 与 tsImport 之间的形状差异
 */
function resolveConfigDefault(mod: ConfigModule): GenerateOptions {
  const candidate = mod.default ?? mod
  const nested = candidate as ConfigModule | undefined

  // tsImport 将 .ts 编译为 CJS 时,实际配置位于 mod.default.default
  if (nested?.__esModule && nested.default !== undefined) {
    return nested.default as GenerateOptions
  }

  return candidate as GenerateOptions
}
