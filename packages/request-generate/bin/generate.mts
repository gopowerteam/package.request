#!/usr/bin/env node
import process from 'node:process'
import { program } from 'commander'
import { generate, loadConfigFile } from '../src/index'

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
  await generate(config)
  process.exit(0)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
