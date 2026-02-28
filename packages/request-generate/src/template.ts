import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import Handlebars from 'handlebars'
import { equalHelper } from './template-helpers/equal.helper'
import { includeQueryParams } from './template-helpers/include-query-params'
import { isArrayHelper } from './template-helpers/is-array.helper'
import { toUpperHelper } from './template-helpers/to-upper.helper'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function registerHandlebarTemplates() {
  registerHandlebarPartials()
  registerHandlebarHelpers()
}

function registerHandlebarPartials() {
  registerHandlebarPartial('is-required')

  registerHandlebarPartial('export-header')
  registerHandlebarPartial('export-description')
  registerHandlebarPartial('export-model-import')
  registerHandlebarPartial('export-model-type')
  registerHandlebarPartial('export-model-field')
  registerHandlebarPartial('export-schema-type')

  registerHandlebarPartial('export-service-import')
  registerHandlebarPartial('export-service-class')
  registerHandlebarPartial('export-service-namespace')
  registerHandlebarPartial('export-service-namespace-type')
  registerHandlebarPartial('export-service-operation')
  registerHandlebarPartial('export-operation-params-path')
  registerHandlebarPartial('export-operation-params-query')
  registerHandlebarPartial('export-operation-params-body')
  registerHandlebarPartial('export-operation-response')
}

function registerHandlebarHelpers() {
  registerHandlebarHelper(equalHelper)
  registerHandlebarHelper(isArrayHelper)
  registerHandlebarHelper(toUpperHelper)
  registerHandlebarHelper(includeQueryParams)
}

function registerHandlebarHelper(helper: {
  name: string
  fn: Handlebars.HelperDelegate
}) {
  Handlebars.registerHelper(helper.name, helper.fn)
}

function registerHandlebarPartial(input: string) {
  const template = loadHandlebarTemplate(`partials/${input}`)
  Handlebars.registerPartial(input, template)
}

export function loadHandlebarTemplate(input: string) {
  const templatePath = path.resolve(__dirname, 'templates', `${input}.hbs`)
  return fs.readFileSync(templatePath, 'utf-8')
}
