import type { Ora } from 'ora'
import chalk from 'chalk'
import ora from 'ora'
import { table } from 'table'

type Alignment = 'left' | 'right' | 'center'

// ---------- 共享表格配置 ----------

const BORDER = {
  topBody: '─',
  topJoin: '┬',
  topLeft: '┌',
  topRight: '┐',
  bottomBody: '─',
  bottomJoin: '┴',
  bottomLeft: '└',
  bottomRight: '┘',
  bodyLeft: '│',
  bodyRight: '│',
  bodyJoin: '│',
  joinBody: '─',
  joinLeft: '├',
  joinRight: '┤',
  joinJoin: '┼',
}

/**
 * 输出阶段横幅
 */
export function printPhaseBanner(label: string) {
  // eslint-disable-next-line no-console
  console.log(chalk.cyan.bold(label))
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 格式化耗时
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms} ms`
  }

  if (ms < 60 * 1000) {
    return `${(ms / 1000).toFixed(1)} s`
  }

  return `${(ms / (60 * 1000)).toFixed(1)} min`
}

/**
 * 通用表格渲染(供下载/生成阶段共用)
 */
export function renderTable(
  header: string[],
  rows: string[][],
  summaryRow?: string[],
  alignments: Alignment[] = header.map(() => 'left'),
) {
  const data = summaryRow ? [header, ...rows, summaryRow] : [header, ...rows]
  const hasSummary = Boolean(summaryRow)

  const config = {
    border: BORDER,
    columns: alignments.map(alignment => ({ alignment })),
    drawHorizontalLine: (lineIndex: number, rowCount: number) => {
      if (lineIndex === 0 || lineIndex === rowCount) {
        return true
      }

      if (lineIndex === 1) {
        return true
      }

      if (hasSummary && lineIndex === rowCount - 1) {
        return true
      }

      return false
    },
  }

  return table(data, config)
}

// ---------- spinner ----------

let spinner: Ora | null = null

export function startSpinner(text = '处理中...') {
  spinner = ora(text).start()
}

export function stopSpinner() {
  if (spinner) {
    spinner.stop()
    spinner = null
  }
}

// ---------- 生成阶段结果 ----------

interface GenerationResult {
  name: string
  models: number
  services: number
}

const results: GenerationResult[] = []

export function collectResult(name: string, models: number, services: number) {
  results.push({ name, models, services })
}

export function clearResults() {
  results.length = 0
}

export function outputSummary() {
  const header = [
    chalk.cyan('Service'),
    chalk.cyan('Models'),
    chalk.cyan('Services'),
    chalk.cyan('Status'),
  ]
  const alignments: Alignment[] = ['left', 'right', 'right', 'center']

  if (results.length === 0) {
    const emptyRow = [chalk.gray('(none)'), '0', '0', chalk.gray('-')]
    // eslint-disable-next-line no-console
    console.log(renderTable(header, [emptyRow], undefined, alignments))
    return
  }

  const rows = results.map(r => [
    r.name,
    r.models.toString(),
    r.services.toString(),
    chalk.green('✓'),
  ])

  const totalModels = results.reduce((sum, r) => sum + r.models, 0)
  const totalServices = results.reduce((sum, r) => sum + r.services, 0)

  const summaryRow = [
    chalk.bold('Total'),
    chalk.bold(totalModels.toString()),
    chalk.bold(totalServices.toString()),
    chalk.bold.green(`${results.length} services`),
  ]

  // eslint-disable-next-line no-console
  console.log(renderTable(header, rows, summaryRow, alignments))
}

// ---------- 下载阶段结果 ----------

interface DownloadResult {
  name: string
  size: number | null
  duration: number | null
}

const downloadResults: DownloadResult[] = []

export function collectDownloadResult(name: string, size: number | null, duration: number | null) {
  downloadResults.push({ name, size, duration })
}

export function clearDownloadResults() {
  downloadResults.length = 0
}

export function outputDownloadSummary(totalDuration?: number) {
  const header = [
    chalk.cyan('Service'),
    chalk.cyan('Size'),
    chalk.cyan('Time'),
    chalk.cyan('Status'),
  ]
  const alignments: Alignment[] = ['left', 'right', 'right', 'center']

  if (downloadResults.length === 0) {
    const emptyRow = [chalk.gray('(none)'), chalk.gray('-'), chalk.gray('-'), chalk.gray('-')]
    // eslint-disable-next-line no-console
    console.log(renderTable(header, [emptyRow], undefined, alignments))
    return
  }

  const rows = downloadResults.map((r) => {
    const size = r.size === null ? chalk.gray('-') : formatSize(r.size)
    const time = r.duration === null ? chalk.gray('-') : formatDuration(r.duration)
    const status = r.size === null ? chalk.red('✗') : chalk.green('✓')
    return [r.name, size, time, status]
  })

  const totalSize = downloadResults.reduce((sum, r) => sum + (r.size ?? 0), 0)
  const okCount = downloadResults.filter(r => r.size !== null).length
  const total = downloadResults.length

  const status
    = okCount === total
      ? chalk.bold.green(`${total} services`)
      : chalk.bold.red(`${okCount}/${total} ok`)

  const totalTime
    = totalDuration === undefined ? chalk.gray('-') : chalk.bold(formatDuration(totalDuration))

  const summaryRow = [
    chalk.bold('Total'),
    chalk.bold(formatSize(totalSize)),
    totalTime,
    status,
  ]

  // eslint-disable-next-line no-console
  console.log(renderTable(header, rows, summaryRow, alignments))
}
