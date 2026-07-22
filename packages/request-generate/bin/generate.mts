#!/usr/bin/env tsx

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { program } from 'commander'
import { loadConfigFile } from './_load-config.mts'

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
  .option('--force', '强制清空输出目录(跳过 .generated 标记检查)')
  .parse(process.argv)
  .opts()

const { default: config } = await loadConfigFile(params.config)

// CLI --force 覆盖配置中的 forceClear
if (params.force) {
  config.forceClear = true
}

try {
  await RequestGenerate.generate(config)
  process.exit(0)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
