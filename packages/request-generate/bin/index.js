#!/usr/bin/env node
'use strict'

const path = require('node:path')
const fs = require('node:fs')
const { program } = require('commander')

const RequestGenerate = require(path.resolve(
  __dirname,
  '..',
  'dist',
  'index.js'
))

const params = program
  .name('@gopowerteam/request-generate')
  .usage('[options]')
  .option('--config <value>', '指定配置文件位置')
  .parse(process.argv)
  .opts()

const configFilePaths = [
  'request-generate.config.cjs',
  'request-generate.config.js'
]

/**
 * 加载配置文件
 * @param {*} filePath
 * @returns
 */
function loadConfigFile(filePath) {
  if (filePath) {
    configFilePaths.unshift(filePath)
  }

  const configFilePath = configFilePaths.find((file) =>
    fs.existsSync(path.resolve(process.cwd(), file))
  )

  if (configFilePath) {
    return require(path.resolve(process.cwd(), configFilePath))
  } else {
    throw new Error('无法找到RequestGenerate配置文件')
  }
}

if (RequestGenerate) {
  const config = loadConfigFile(params.config)
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
