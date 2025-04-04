#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { program } from 'commander'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RequestGenerate = await import(`file://${path.resolve(
  __dirname,
  '..',
  'dist',
  'index.mjs',
)}`)

const params = program
  .name('@gopowerteam/request-generate')
  .usage('[options]')
  .option('--config <value>', '指定配置文件位置')
  .parse(process.argv)
  .opts()

const configFilePaths = [
  'request.config.ts',
  'request-generate.config.cjs',
  'request-generate.config.js',
]

/**
 * 加载配置文件
 * @param {*} filePath
 */
async function loadConfigFile(filePath) {
  if (filePath) {
    configFilePaths.unshift(filePath)
  }

  const configFilePath = configFilePaths.find(file =>
    fs.existsSync(path.resolve(process.cwd(), file)),
  )

  if (!configFilePath) {
    throw new Error('Not Found Config File.')
  }

  if (configFilePath.endsWith('.js') || configFilePath.endsWith('.ts')) {
    return import(`file://${path.resolve(process.cwd(), configFilePath)}`)
  }
  else {
    throw new Error('无法找到RequestGenerate配置文件')
  }
}

if (RequestGenerate) {
  const { default: config } = await loadConfigFile(params.config)

  RequestGenerate.download(config)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('接口文件更新完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
