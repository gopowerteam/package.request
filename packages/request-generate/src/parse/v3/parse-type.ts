import type { ModelType } from '../../types/model/model-type'
import { parseMappedType } from './parse-mapped-type'

export function parseType(type: string, format?: string) {
  const mapped = parseMappedType(type, format)

  const result: ModelType = {
    type: 'any',
    base: 'any',
    template: null,
    imports: [],
    isNullable: false
  }

  if (mapped) {
    result.type = mapped
    result.base = mapped
    return result
  }

  return result
}
