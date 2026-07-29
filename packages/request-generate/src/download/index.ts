import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../types/generate-options'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  clearDownloadResults,
  collectDownloadResult,
  outputDownloadSummary,
  printPhaseBanner,
  startSpinner,
  stopSpinner,
} from '../progress'
import { generateServiceOptions } from '../utils/get-services-options'

const DefaultDownloadDir = '.request'

export class Download {
  public static options: GenerateOptions

  static async startup(options: GenerateOptions) {
    const enabled = options.logger !== false

    // 生成服务列表
    const applicationOptions = generateServiceOptions(options)

    // 创建.request目录
    if (!fs.existsSync(DefaultDownloadDir)) {
      fs.mkdirSync(DefaultDownloadDir, { recursive: true })
    }

    if (enabled) {
      clearDownloadResults()
      printPhaseBanner('开始下载接口文件：')
      startSpinner('下载中...')
    }

    // 下载所有OpenAPI文件(全部尝试,失败项在表格中标注)
    const downloadStart = Date.now()
    const settled = await Promise.allSettled(
      applicationOptions.map(option => Download.downloadOpenAPIFile(option)),
    )
    const totalDuration = Date.now() - downloadStart

    // 收集结果
    const failures: unknown[] = []
    applicationOptions.forEach((option, index) => {
      const result = settled[index]
      const name = option.name ?? 'default'

      if (result.status === 'fulfilled') {
        if (enabled) {
          collectDownloadResult(name, result.value.size, result.value.duration)
        }
      }
      else {
        failures.push(result.reason)
        if (enabled) {
          collectDownloadResult(name, null, null)
        }
      }
    })

    if (enabled) {
      stopSpinner()
      outputDownloadSummary(totalDuration)
    }

    // 存在失败则抛出第一个错误,中断后续生成阶段(&& 链)
    if (failures.length > 0) {
      throw failures[0]
    }
  }

  static async downloadOpenAPIFile(option: GenerateApplicationOptions): Promise<{ size: number, duration: number }> {
    const start = Date.now()
    const response = await fetch(option.input)

    if (!response.ok) {
      throw new Error(
        `下载失败: ${option.input} 返回状态码 ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    const filePath = path.join('.request', `${option.name}.json`)
    const content = JSON.stringify(data, null, 2)

    // 写入文件
    fs.writeFileSync(filePath, content)
    return { size: Buffer.byteLength(content), duration: Date.now() - start }
  }
}
