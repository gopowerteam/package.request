import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { GenerateApplicationOptions } from '../types/generate-options'

const ConfigFileName = '.config.json'
const ConfigFilePath = path.resolve('.request', ConfigFileName)

interface ConfigFileItem {
  name: string
  md5: string
  updatedAt: string
}

/**
 * 生成应用配置文件
 */
export function updateOptionsFromLocalConfig(options: GenerateApplicationOptions[]): GenerateApplicationOptions[] {
  const config = readLocalConfig()

  const toUpdateOptions: Map<string, string> = new Map()

  options = options.filter((item) => {
    const md5 = isFindNewMd5(item.name!, config)

    if (md5) {
      toUpdateOptions.set(item.name!, md5)
      return true
    }
    else {
      return false
    }
  })

  writeLocalConfig(toUpdateOptions, config)

  return options
}

/**
 * 比较文件的MD5值判断文件是否更新
 */
export function isFindNewMd5(name: string, config: ConfigFileItem[]) {
  const file = path.resolve('.request', `${name}.json`)

  if (!fs.existsSync(file)) {
    throw new Error(`未找到相应的配置文件: ${name}.json`)
  }

  // 读取文件的MD5值
  const data = fs.readFileSync(file)
  const md5 = crypto.createHash('md5').update(data.toString()).digest('hex')

  // 查找匹配的配置项
  const configItem = config.find(x => x.name === name)

  // 如果文件不存在或者MD5值不一致则表示文件已更新
  return (!configItem || configItem.md5 !== md5) ? md5 : ''
}

export function readLocalConfig(): ConfigFileItem[] {
  if (!fs.existsSync(ConfigFilePath)) {
    return []
  }

  // 读取本地配置文件
  const data = fs.readFileSync(ConfigFilePath, 'utf-8')
  return JSON.parse(data) as ConfigFileItem[]
}

export function writeLocalConfig(toUpdateOptions: Map<string, string>, config: ConfigFileItem[]) {
  // Update or add new config items
  toUpdateOptions.forEach((md5, name) => {
    const configItem = config.find(x => x.name === name)
    if (configItem) {
      configItem.md5 = md5
      configItem.updatedAt = new Date().toISOString()
    }
    else {
      config.push({
        name,
        md5,
        updatedAt: new Date().toISOString(),
      })
    }
  })

  fs.writeFileSync(ConfigFilePath, JSON.stringify(config, null, 2))
}
