import chalk from 'chalk'
import ora, { type Ora } from 'ora'

interface Progress {
  spinner: Ora
  model: {
    total: number
    value: number
  }
  service: {
    total: number
    value: number
  }
}

const progressMaps = new Map<string, Progress>()

export function createProgress(
  name: string,
) {
  const spinner = ora(
    formatProgressText(name),
  ).start()

  progressMaps.set(name, {
    spinner,
    model: {
      total: 0,
      value: 0,
    },
    service: {
      total: 0,
      value: 0,
    },
  })
}

export function startProgress(name: string, options: { models: number, services: number }) {
  const progress = progressMaps.get(name)

  if (progress) {
    progress.model = {
      total: options.models,
      value: 0,
    }

    progress.service = {
      total: options.services,
      value: 0,
    }

    updateProgressText(name, progress)
  }
}

function formatProgressText(name: string, progress?: Progress) {
  const toStateText = (text: string) => `${chalk.green(text)}`
  const toNameText = (text: string) => `${chalk.cyan(text).padEnd(20, ' ')}`
  const toModelText = (text: string) => `${chalk.greenBright('Model')}:${chalk.gray(text).padEnd(10, ' ')}`
  const toServiceText = (text: string) => `${chalk.greenBright('Service')}:${chalk.gray(text).padEnd(10, ' ')}`
  const isFinish = progress?.model.value === progress?.model.total && progress?.service.value === progress?.service.total

  if (progress) {
    const stateText = toStateText(isFinish ? '生成完成' : '生成中')
    const nameText = toNameText(name)
    const modelText = toModelText(`${progress.model.value} / ${progress.model.total}`)
    const serviceText = toServiceText(`${progress.service.value} / ${progress.service.total}`)
    return `${stateText} | ${nameText} | ${modelText} | ${serviceText}`
  }
  else {
    const stateText = toStateText('开始请求')
    const nameText = toNameText(name)
    return `${stateText} | ${nameText}`
  }
}

function updateProgressText(name: string, progress: Progress) {
  const isFinish = progress?.model.value === progress?.model.total && progress?.service.value === progress?.service.total

  if (isFinish) {
    progress.spinner.succeed(formatProgressText(name, progress))
  }
  else {
    progress.spinner.text = formatProgressText(name, progress)
  }
}

export function updateProgress(name: string, type: 'model' | 'service') {
  const progress = progressMaps.get(name)

  if (!progress) {
    return
  }

  progress[type].value++
  updateProgressText(name, progress)
}
