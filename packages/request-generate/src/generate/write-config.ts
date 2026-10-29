import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { version as packageVersion } from '../../package.json'

const ConfigFileName = '.config.json'

interface ConfigFileItem {
  name: string
  md5: string
  /** 生成规则指纹(旧账本缺省时视为需重新生成) */
  configMd5?: string
  updatedAt: string
}

/**
 * 待提交的账本条目
 */
export interface PendingConfigEntry {
  /** 文档文件 MD5 */
  md5: string
  /** 生成规则指纹 */
  configMd5: string
}

/**
 * 增量生成规划结果
 */
export interface GenerationPlan {
  /** 需要重新生成的应用(input 已改写为本地文档路径) */
  pending: GenerateApplicationOptions[]
  /** 待提交的账本条目(全部生成成功后调用 commitGenerationConfig 落盘) */
  entries: Map<string, PendingConfigEntry>
}

/**
 * 配置文件路径(延迟解析,允许运行时切换 cwd,便于测试)
 */
function getConfigFilePath(): string {
  return path.resolve('.request', ConfigFileName)
}

/**
 * 稳定序列化:对象 key 排序、数组元素排序、函数取源码文本
 */
function stableSerialize(value: unknown): string {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).sort().join(',')}]`
  }

  if (typeof value === 'function') {
    return value.toString()
  }

  switch (typeof value) {
    case 'object':
      return `{${Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => `${key}:${stableSerialize(item)}`)
        .join(',')}}`
    case 'undefined':
      return 'undefined'
    default:
      return JSON.stringify(value) ?? String(value)
  }
}

/**
 * 计算生成规则指纹
 *
 * 覆盖所有影响产物的配置项 + 包版本号(模板随版本变化);
 * 刻意排除 forceClear(CLI --force 注入,避免污染账本)、logger、gateway/input、output
 * 等不影响产物的字段。
 */
export function getConfigFingerprint(
  options: GenerateOptions,
  application?: GenerateApplicationOptions,
): string {
  const fingerprint = {
    appendService: options.appendService,
    application: application?.application,
    exportModels: options.exportModels,
    exportServices: options.exportServices
      ? {
          excludeQueryParams: [...(options.exportServices.excludeQueryParams ?? [])].sort(),
          operationResolve: options.exportServices.operationResolve?.toString(),
          responseType: options.exportServices.responseType,
          serviceResolve: options.exportServices.serviceResolve?.toString(),
        }
      : undefined,
    version: packageVersion,
  }

  return crypto.createHash('md5').update(stableSerialize(fingerprint)).digest('hex')
}

/**
 * 读取本地账本;文件不存在或内容损坏时返回空数组(全量重生成,不中断)
 */
export function readLocalConfig(): ConfigFileItem[] {
  const configFilePath = getConfigFilePath()

  if (!fs.existsSync(configFilePath)) {
    return []
  }

  try {
    const data = fs.readFileSync(configFilePath, 'utf-8')
    return JSON.parse(data) as ConfigFileItem[]
  }
  catch {
    return []
  }
}

/**
 * 比较文档 MD5 与生成规则指纹判断是否需要重新生成
 *
 * @returns 需要重新生成时返回文档 MD5(供账本提交复用),否则返回 undefined
 */
export function isNeedUpdate(
  name: string,
  config: ConfigFileItem[],
  output: string,
  configMd5: string,
): string | void {
  const file = path.resolve('.request', `${name}.json`)
  const outputDir = path.resolve(output)

  if (!fs.existsSync(file)) {
    throw new Error(`未找到相应的配置文件: ${file}`)
  }

  // 读取文件的MD5值
  const data = fs.readFileSync(file)
  const md5 = crypto.createHash('md5').update(data).digest('hex')

  // output目录不存在直接重新生成
  if (!fs.existsSync(path.join(outputDir, name))) {
    return md5
  }

  // 查找匹配的配置项
  const configItem = config.find(x => x.name === name)

  // 文档 MD5 或生成规则指纹任一不一致则重新生成
  if (!configItem || configItem.md5 !== md5 || configItem.configMd5 !== configMd5) {
    return md5
  }
}

/**
 * 增量生成规划:过滤需重新生成的应用并改写为本地文档输入
 *
 * 仅规划不落盘;账本由 commitGenerationConfig 在全部生成成功后提交,
 * 避免生成中途失败导致账本与产物不一致(陈旧产物)。
 */
export function planGeneration(
  options: GenerateApplicationOptions[],
  generateOptions: GenerateOptions,
): GenerationPlan {
  const config = readLocalConfig()
  const entries = new Map<string, PendingConfigEntry>()

  const pending = options.filter((item) => {
    const itemConfigMd5 = getConfigFingerprint(generateOptions, item)
    const md5 = isNeedUpdate(item.name!, config, generateOptions.output, itemConfigMd5)

    if (md5) {
      entries.set(item.name!, { md5, configMd5: itemConfigMd5 })
      return true
    }
    else {
      return false
    }
  })

  // 更新配置文件路径为本地文档(生成阶段不再走网络)
  pending.forEach((item) => {
    item.input = path.resolve('.request', `${item.name}.json`)
  })

  return { entries, pending }
}

/**
 * 提交账本:更新/新增条目并写入配置文件
 *
 * @param entries 规划阶段产生的待提交条目
 * @param config 账本基础数据,缺省时重新读取(生成期间账本未被本进程修改)
 */
export function commitGenerationConfig(
  entries: Map<string, PendingConfigEntry>,
  config: ConfigFileItem[] = readLocalConfig(),
): void {
  entries.forEach((entry, name) => {
    const configItem = config.find(x => x.name === name)
    if (configItem) {
      configItem.md5 = entry.md5
      configItem.configMd5 = entry.configMd5
      configItem.updatedAt = new Date().toISOString()
    }
    else {
      config.push({
        configMd5: entry.configMd5,
        md5: entry.md5,
        name,
        updatedAt: new Date().toISOString(),
      })
    }
  })

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(config, null, 2))
}
