import { Download } from './download'
import { Generate } from './generate'

export * from './define-config'
export { loadConfigFile } from './load-config'
export type { GenerateOptions } from './types/generate-options'

export const generate = Generate.startup
export const download = Download.startup
