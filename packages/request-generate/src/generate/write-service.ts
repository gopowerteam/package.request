import Handlebars from 'handlebars'
import { loadHandlebarTemplate } from '../template'
import { writeFile } from './write-file'
import type { Service } from '../entities/service'

/**
 * 写入Service文件
 * @param service
 * @param output
 */
export function writeService(service: Service, output: string) {
  const templateSource = loadHandlebarTemplate('export-service')
  // 生成模板
  const template = Handlebars.compile(templateSource)
  // 编译模板内容
  const templateResult = template(service)
  // 写入文件
  writeFile(output, templateResult)
}
