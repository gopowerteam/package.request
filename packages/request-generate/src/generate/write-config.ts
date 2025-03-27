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
export function updateOptionsFromLocalConfig(options: GenerateApplicationOptions[], output: string): GenerateApplicationOptions[] {
  const config = readLocalConfig()

  const toUpdateOptions: Map<string, string> = new Map()

  // 过滤需要更新的配置项
  options = options.filter((item) => {
    const md5 = isNeedUpdate(item.name!, config, output)

    if (md5) {
      toUpdateOptions.set(item.name!, md5)
      return true
    }
    else {
      return false
    }
  })

  // 更新配置文件路径
  options.forEach((item) => {
    const file = path.resolve('.request', `${item.name}.json`)
    item.input = file
  })

  writeLocalConfig(toUpdateOptions, config)

  return options
}

/**
 * 比较文件的MD5值判断文件是否更新
 */
export function isNeedUpdate(name: string, config: ConfigFileItem[], output: string): string | void {
  const file = path.resolve('.request', `${name}.json`)
  const outputDir = path.resolve(output)

  if (!fs.existsSync(file)) {
    throw new Error(`未找到相应的配置文件: ${name}.json`)
  }

  // 读取文件的MD5值
  const data = fs.readFileSync(file)
  const md5 = crypto.createHash('md5').update(data.toString()).digest('hex')

  // output目录不存在直接重新生成
  if (!fs.existsSync(path.join(outputDir, name))) {
    return md5
  }

  // 查找匹配的配置项
  const configItem = config.find(x => x.name === name)

  // 如果文件不存在或者MD5值不一致则表示文件已更新
  if (!configItem || configItem.md5 !== md5) {
    return md5
  }
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
