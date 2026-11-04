#!/usr/bin/env node
import process from 'node:process'
import { program } from 'commander'
import { download, loadConfigFile } from '../src/index'

const params = program
  .name('@gopowerteam/request-generate')
  .usage('[options]')
  .option('--config <value>', '指定配置文件位置')
  .parse(process.argv)
  .opts()

const { default: config } = await loadConfigFile(params.config)

download(config)
  .then(() => {
    process.exit(0)
  })
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  })
