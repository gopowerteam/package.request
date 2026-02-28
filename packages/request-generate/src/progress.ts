import type { Ora } from 'ora'
import chalk from 'chalk'
import ora from 'ora'
import { table } from 'table'

interface GenerationResult {
  name: string
  models: number
  services: number
}

const results: GenerationResult[] = []
let spinner: Ora | null = null

export function startSpinner() {
  spinner = ora('生成中...').start()
}

export function stopSpinner() {
  if (spinner) {
    spinner.stop()
    spinner = null
  }
}

export function collectResult(name: string, models: number, services: number) {
  results.push({ name, models, services })
}

export function outputSummary() {
  const header = [
    chalk.cyan('Service'),
    chalk.cyan('Models'),
    chalk.cyan('Services'),
    chalk.cyan('Status'),
  ]

  const border = {
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

  const config = {
    border,
    columns: [
      { alignment: 'left' as const },
      { alignment: 'right' as const },
      { alignment: 'right' as const },
      { alignment: 'center' as const },
    ],
    drawHorizontalLine: (lineIndex: number, rowCount: number) => {
      return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount - 1 || lineIndex === rowCount
    },
  }

  if (results.length === 0) {
    const emptyRow = [chalk.gray('(none)'), '0', '0', chalk.gray('-')]
    const tableData = [header, emptyRow]
    // eslint-disable-next-line no-console
    console.log(table(tableData, config))
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

  const tableData = [header, ...rows, summaryRow]

  // eslint-disable-next-line no-console
  console.log(table(tableData, config))
}

export function clearResults() {
  results.length = 0
}
