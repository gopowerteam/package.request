import * as fs from 'node:fs'
/**
 *
 * @param output
 * @param content
 */
export function writeFile(output: string, content: string) {
  fs.writeFileSync(output, content, 'utf-8')
}
