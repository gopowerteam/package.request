#!/usr/bin/env tsx

import path from 'node:path'
import fs from 'node:fs'
import { program } from 'commander'
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RequestGenerate = await import(path.resolve(
  __dirname,
  '..',
  'dist',
  'index.mjs'
))

const params = program
  .name('@gopowerteam/request-generate')
  .usage('[options]')
  .option('--config <value>', '指定配置文件位置')
  .parse(process.argv)
  .opts()

const configFilePaths = [
  'request.config.ts',
  'request-generate.config.cjs',
  'request-generate.config.js'
]

/**
 * 加载配置文件
 * @param {*} filePath
 * @returns
 */
async function loadConfigFile(filePath) {
  if (filePath) {
    configFilePaths.unshift(filePath)
  }

  const configFilePath = configFilePaths.find((file) =>
    fs.existsSync(path.resolve(process.cwd(), file))
  )

  if(!configFilePath){
    throw new Error("Not Find Config File.")
  }

  if (configFilePath.endsWith('js')) {
    return import(path.resolve(process.cwd(), configFilePath))
  } else if (configFilePath.endsWith('ts')) {
    return import(path.resolve(process.cwd(), configFilePath))
  } else {
    throw new Error('无法找到RequestGenerate配置文件')
  }
}

if (RequestGenerate) {
  const { default: config } = await loadConfigFile(params.config)

  RequestGenerate.default(config)
    .then(() => {
      console.log('接口文件生成完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
