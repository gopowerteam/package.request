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

/**
 * 下载元数据(条件请求 validator)
 */
interface DownloadMeta {
  etag?: string
  lastModified?: string
}

/**
 * 下载结果(unchanged 表示服务端返回 304,内容未变化)
 */
interface DownloadResultInfo {
  size: number
  duration: number
  unchanged?: boolean
}

function getMetaPath(name: string): string {
  return path.join(DefaultDownloadDir, `${name}.meta.json`)
}

/**
 * 读取下载元数据;文件不存在或损坏时返回空对象(全量下载,不中断)
 */
function readMeta(name: string): DownloadMeta {
  try {
    return JSON.parse(fs.readFileSync(getMetaPath(name), 'utf-8')) as DownloadMeta
  }
  catch {
    return {}
  }
}

function writeMeta(name: string, meta: DownloadMeta): void {
  fs.writeFileSync(getMetaPath(name), JSON.stringify(meta, null, 2))
}

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
          collectDownloadResult(name, result.value.size, result.value.duration, result.value.unchanged)
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

  static async downloadOpenAPIFile(option: GenerateApplicationOptions): Promise<DownloadResultInfo> {
    const start = Date.now()
    // 与 startup 汇总展示保持一致的默认应用名
    const name = option.name ?? 'default'
    const specPath = path.join(DefaultDownloadDir, `${name}.json`)

    // 本地文件输入:直读复制,不走网络与条件请求。
    // 注意:input 由 gateway/openapi 拼接并压缩连续斜杠,https:// 会变成 https:/,
    // 故按协议前缀判断而非完整 scheme:// 形式
    if (!option.input.startsWith('http:') && !option.input.startsWith('https:')) {
      const content = fs.readFileSync(option.input, 'utf-8')
      fs.writeFileSync(specPath, content)
      return {
        size: Buffer.byteLength(content),
        duration: Date.now() - start,
      }
    }

    // 条件请求:spec 文件存在时才携带 validator,
    // 避免文件缺失但 meta 残留时 304 跳过重建(后续生成阶段将找不到本地文档)
    const meta = readMeta(name)
    const headers: Record<string, string> = {}
    const hasSpec = fs.existsSync(specPath)
    if (hasSpec && meta.etag) {
      headers['If-None-Match'] = meta.etag
    }
    if (hasSpec && meta.lastModified) {
      headers['If-Modified-Since'] = meta.lastModified
    }

    const response = await fetch(option.input, { headers })

    // 304:内容未变化,保留本地文档原样(生成阶段账本按内容 MD5 自然跳过)
    if (response.status === 304) {
      return { size: 0, duration: Date.now() - start, unchanged: true }
    }

    if (!response.ok) {
      throw new Error(
        `下载失败: ${option.input} 返回状态码 ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    const content = JSON.stringify(data, null, 2)

    // 写入文件
    fs.writeFileSync(specPath, content)

    // 持久化 validator 供下次条件请求(ETag 优先,Last-Modified/Date 兜底)
    const etag = response.headers.get('etag')
    const lastModified = response.headers.get('last-modified') ?? response.headers.get('date')
    if (etag || lastModified) {
      writeMeta(name, {
        etag: etag ?? undefined,
        lastModified: lastModified ?? undefined,
      })
    }

    return {
      size: Buffer.byteLength(content),
      duration: Date.now() - start,
    }
  }
}
