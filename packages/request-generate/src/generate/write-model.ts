import Handlebars from 'handlebars'
import type { Model } from '../entities/model'
import { loadHandlebarTemplate } from '../utils/handlebar-templates'
import { writeFile } from './write-file'

export function writeModel(model: Model, output: string) {
  const templateSource = loadHandlebarTemplate('export-model')
  const template = Handlebars.compile(templateSource)
  // 编译模板内容
  const templateResult = template(model)

  writeFile(output, templateResult)
}
