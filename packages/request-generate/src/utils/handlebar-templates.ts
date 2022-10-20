import * as fs from 'node:fs'
import * as path from 'node:path'

import Handlebars from 'handlebars'
import { equalHelper } from '../templates/helpers/equal.helper'
import { isArrayHelper } from '../templates/helpers/is-array.helper'

export function registerHandlebarTemplates() {
  // 注册Partials
  registerHandlebarPartials()
  // 注册Helpers
  registerHandlebarHelpers()
}

function registerHandlebarPartials() {
  registerHandlebarPartial('is-required')
  registerHandlebarPartial('export-header')
  registerHandlebarPartial('export-description')
  registerHandlebarPartial('export-model-import')
  registerHandlebarPartial('export-model-type')
  registerHandlebarPartial('export-model-field')
  registerHandlebarPartial('export-model-field-type')
}

function registerHandlebarHelpers() {
  Handlebars.registerHelper(isArrayHelper.name, isArrayHelper.fn)
  Handlebars.registerHelper(equalHelper.name, equalHelper.fn)
}
/**
 * 注册Handlebar模板
 */
function registerHandlebarPartial(input: string) {
  const template = loadHandlebarTemplate(`partials/${input}`)
  Handlebars.registerPartial(input, template)
}
/**
 * 加载模板
 * @returns
 */
export function loadHandlebarTemplate(input: string) {
  const templatePath = path.resolve(
    __dirname,
    '..',
    'templates',
    `${input}.hbs`
  )
  return fs.readFileSync(templatePath, 'utf-8')
}
