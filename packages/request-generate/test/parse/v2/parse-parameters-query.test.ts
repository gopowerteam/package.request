import type { OpenAPIV2 } from 'openapi-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { Generate } from '../../../src/generate'
import { parseParametersQuery } from '../../../src/parse/v2/parse-parameters-query'

function queryParam(overrides: Partial<OpenAPIV2.ParameterObject> = {}): OpenAPIV2.Parameter {
  return ({ name: 'page', in: 'query', type: 'integer' as any, ...overrides }) as any
}

describe('parseParametersQuery (V2) - query 参数解析', () => {
  beforeEach(() => {
    // 重置 Generate.options,避免用例间污染
    Generate.options = undefined as any
  })

  describe('基础解析', () => {
    it('单个 query 参数应正确解析', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'page', type: 'integer' as any }),
      ])
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('page')
      expect(result[0].in).toBe('query')
      expect(result[0].type).toBe('number')
    })

    it('多个 query 参数应全部解析', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'page', type: 'integer' as any }),
        queryParam({ name: 'size', type: 'integer' as any }),
        queryParam({ name: 'keyword', type: 'string' }),
      ])
      expect(result).toHaveLength(3)
      expect(result.map(p => p.name)).toEqual(['page', 'size', 'keyword'])
    })

    it('$ref 参数应被跳过', () => {
      const result = parseParametersQuery([
        { $ref: '#/parameters/PageParam' } as any,
        queryParam({ name: 'size', type: 'integer' as any }),
      ])
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('size')
    })

    it('非 query 参数(path/body/formData)应被跳过', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'q' }),
        { name: 'id', in: 'path', type: 'string' } as any,
        { name: 'body', in: 'body', schema: { type: 'object' } } as any,
        { name: 'file', in: 'formData', type: 'file' } as any,
      ])
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('q')
    })

    it('required 与 description 透传', () => {
      const result = parseParametersQuery([
        queryParam({
          name: 'keyword',
          type: 'string',
          required: true,
          description: '搜索关键词',
        }),
      ])
      expect(result[0].required).toBe(true)
      expect(result[0].description).toBe('搜索关键词')
    })

    it('enum 字段透传', () => {
      const result = parseParametersQuery([
        queryParam({
          name: 'status',
          type: 'string',
          enum: ['active', 'inactive'],
        } as any),
      ])
      expect(result[0].enums).toEqual(['active', 'inactive'])
    })
  })

  describe('excludeQueryParams 配置过滤', () => {
    it('匹配 name 时应过滤(无点号名)', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '/tmp',
        exportServices: { excludeQueryParams: ['page'] },
      } as any

      const result = parseParametersQuery([
        queryParam({ name: 'page', type: 'integer' as any }),
        queryParam({ name: 'size', type: 'integer' as any }),
      ])
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('size')
    })

    it('匹配 name.split(".")[0] 时应过滤(点号名,如 user.name → user)', () => {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: '/tmp',
        exportServices: { excludeQueryParams: ['user'] },
      } as any

      const result = parseParametersQuery([
        queryParam({ name: 'user.name', type: 'string' }),
        queryParam({ name: 'user.age', type: 'integer' as any }),
        queryParam({ name: 'page', type: 'integer' as any }),
      ])
      // user.name 与 user.age 都被过滤(因为 split('.')[0] === 'user')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('page')
    })

    it('excludeQueryParams 未配置时应透传全部', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'page', type: 'integer' as any }),
      ])
      expect(result).toHaveLength(1)
    })
  })

  describe('点号名称转义', () => {
    it('中间含点号的名称应被双引号包裹(user.name → "user.name")', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'user.name', type: 'string' }),
      ])
      expect(result[0].name).toBe('"user.name"')
    })

    it('前置点号不应转义(.foo 保持原样)', () => {
      const result = parseParametersQuery([
        queryParam({ name: '.foo', type: 'string' }),
      ])
      expect(result[0].name).toBe('.foo')
    })

    it('后置点号不应转义(foo. 保持原样)', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'foo.', type: 'string' }),
      ])
      expect(result[0].name).toBe('foo.')
    })

    it('无点号名称不转义', () => {
      const result = parseParametersQuery([
        queryParam({ name: 'page', type: 'integer' as any }),
      ])
      expect(result[0].name).toBe('page')
    })
  })
})
