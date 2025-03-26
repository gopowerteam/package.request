import * as fs from 'node:fs'
import * as path from 'node:path'
import { generateServiceOptions } from '../utils/get-services-options'
import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'

const DefaultDownloadDir = '.request'

export class Download {
  public static options: GenerateOptions

  static async startup(options: GenerateOptions) {
    // 生成服务列表
    const applicationOptions = generateServiceOptions(options)

    // 创建.request目录
    if (!fs.existsSync(DefaultDownloadDir)) {
      fs.mkdirSync(DefaultDownloadDir)
    }

    // 下载所有OpenAPI文件
    await Promise.all(
      applicationOptions.map(options => Download.downloadOpenAPIFile(options)),
    )
  }

  static async downloadOpenAPIFile(option: GenerateApplicationOptions) {
    const response = await fetch(option.input)
    const data = await response.json()
    const filePath = path.join('.request', `${option.name}.json`)

    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return data
  }
}
