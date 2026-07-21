import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseParametersPath } from '../../../src/parse/v2/parse-parameters-path'

function pathParam(overrides: Partial<OpenAPIV2.ParameterObject> = {}): OpenAPIV2.Parameter {
  return ({ name: 'id', in: 'path', type: 'string', required: true, ...overrides }) as any
}

describe('parseParametersPath (V2) - path 参数解析', () => {
  it('单个 path 参数应正确解析', () => {
    const result = parseParametersPath([
      pathParam({ name: 'id', type: 'string' }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('id')
    expect(result[0].in).toBe('path')
    expect(result[0].type).toBe('string')
  })

  it('多个 path 参数应全部解析', () => {
    const result = parseParametersPath([
      pathParam({ name: 'userId', type: 'string' }),
      pathParam({ name: 'orderId', type: 'integer' }),
    ])
    expect(result).toHaveLength(2)
    expect(result.map(p => p.name)).toEqual(['userId', 'orderId'])
    expect(result[1].type).toBe('number')
  })

  it('$ref 参数应被跳过', () => {
    const result = parseParametersPath([
      { $ref: '#/parameters/IdParam' } as any,
      pathParam({ name: 'id', type: 'string' }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('id')
  })

  it('非 path 参数(query/body/formData)应被跳过', () => {
    const result = parseParametersPath([
      pathParam({ name: 'pathId', type: 'string' }),
      { name: 'q', in: 'query', type: 'string' } as any,
      { name: 'body', in: 'body', schema: { type: 'object' } } as any,
      { name: 'file', in: 'formData', type: 'file' } as any,
    ])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('pathId')
  })

  it('description 字段透传', () => {
    const result = parseParametersPath([
      pathParam({ name: 'id', description: '用户 ID' }),
    ])
    expect(result[0].description).toBe('用户 ID')
  })

  it('整数类型 path 参数应映射为 number', () => {
    const result = parseParametersPath([
      pathParam({ name: 'page', type: 'integer' }),
    ])
    expect(result[0].type).toBe('number')
  })
})
