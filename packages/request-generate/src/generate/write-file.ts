import * as fs from 'node:fs'
import { Generate } from '.'

const ConsoleLogBlue = '\x1b[34m'
const ConsoleLogGreen = '\x1b[32m'
const ConsoleLogReset = '\x1b[0m'
/**
 *
 * @param output
 * @param content
 */
export function writeFile(output: string, content: string) {
  fs.writeFileSync(output, content, 'utf-8')

  if (Generate.options?.logger) {
    console.log(
      ConsoleLogBlue,
      'Generate File: ',
      ConsoleLogGreen,
      output,
      ConsoleLogReset
    )
  }
}
