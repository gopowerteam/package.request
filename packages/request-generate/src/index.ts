import { Download } from './download'
import { Generate } from './generate'

export * from './deine-config'
export type { GenerateOptions } from './types/generate-options'

export const generate = Generate.startup
export const download = Download.startup
