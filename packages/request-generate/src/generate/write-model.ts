import Handlebars from 'handlebars'
import { loadHandlebarTemplate } from '../template'
import { writeFile } from './write-file'
import type { Model } from '../entities/model'

export function writeModel(model: Model, output: string) {
  const templateSource = loadHandlebarTemplate('export-model')
  const template = Handlebars.compile(templateSource)
  // 编译模板内容
  const templateResult = template(model)

  writeFile(output, templateResult)
}
