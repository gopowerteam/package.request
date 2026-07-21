import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseParametersBody } from '../../../src/parse/v2/parse-parameters-body'

function bodyParam(schema: any): OpenAPIV2.Parameter {
  return ({ name: 'body', in: 'body', schema }) as any
}

describe('parseParametersBody (V2) - consumes 媒体类型感知(body 参数 + 模式 A)', () => {
  describe('非 JSON consumes → 整体类型映射', () => {
    it('consumes=[application/pdf] 应映射为 Blob + mediaType', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string', format: 'binary' })],
        ['application/pdf'],
      )
      expect(param?.type).toBe('Blob')
      expect(param?.mediaType).toBe('application/pdf')
    })

    it('consumes=[application/octet-stream] 应映射为 Blob', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string' })],
        ['application/octet-stream'],
      )
      expect(param?.type).toBe('Blob')
      expect(param?.mediaType).toBe('application/octet-stream')
    })

    it('consumes=[text/csv] 应映射为 string + mediaType', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string' })],
        ['text/csv'],
      )
      expect(param?.type).toBe('string')
      expect(param?.mediaType).toBe('text/csv')
    })

    it('consumes=[application/x-www-form-urlencoded] 应映射为 URLSearchParams', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'object' })],
        ['application/x-www-form-urlencoded'],
      )
      expect(param?.type).toBe('URLSearchParams')
      expect(param?.mediaType).toBe('application/x-www-form-urlencoded')
    })

    it('consumes=[multipart/form-data] (模式 A 罕见写法) 应映射为 FormData', () => {
      const param = parseParametersBody(
        [bodyParam({
          type: 'object',
          properties: { file: { type: 'string', format: 'binary' } },
        })],
        ['multipart/form-data'],
      )
      expect(param?.type).toBe('FormData')
      expect(param?.mediaType).toBe('multipart/form-data')
    })

    it('consumes=[image/png] 应映射为 Blob', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string' })],
        ['image/png'],
      )
      expect(param?.type).toBe('Blob')
      expect(param?.mediaType).toBe('image/png')
    })
  })

  describe('jSON 家族 / 无 consumes → 现有 schema 派生行为(零变化)', () => {
    it('consumes=[application/json] 应走 schema 派生 + 无 mediaType', () => {
      const param = parseParametersBody(
        [bodyParam({ $ref: '#/definitions/User' })],
        ['application/json'],
      )
      expect(param?.ref).toBe('User')
      expect(param?.imports).toContain('User')
      expect(param?.mediaType).toBeUndefined()
    })

    it('consumes=[application/json; charset=utf-8] 走 schema(JSON 家族守卫)', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string' })],
        ['application/json; charset=utf-8'],
      )
      expect(param?.type).toBe('string')
      expect(param?.mediaType).toBeUndefined()
    })

    it('consumes=[] (空数组) 走 schema 派生', () => {
      const param = parseParametersBody(
        [bodyParam({ $ref: '#/definitions/User' })],
        [],
      )
      expect(param?.ref).toBe('User')
      expect(param?.mediaType).toBeUndefined()
    })

    it('consumes 未传(向后兼容,旧调用者)走 schema 派生', () => {
      const param = parseParametersBody(
        [bodyParam({ $ref: '#/definitions/User' })],
      )
      expect(param?.ref).toBe('User')
      expect(param?.mediaType).toBeUndefined()
    })
  })

  describe('多 consumes 共存时的优先级(决策 5-A:JSON 家族优先)', () => {
    it('jSON 家族优先于非 JSON(application/json + multipart → JSON 胜)', () => {
      const param = parseParametersBody(
        [bodyParam({ $ref: '#/definitions/User' })],
        ['application/json', 'multipart/form-data'],
      )
      expect(param?.ref).toBe('User')
      expect(param?.mediaType).toBeUndefined()
    })

    it('多个非 JSON 共存,取第一个命中的(按 consumes 顺序,跳过 unknown)', () => {
      const param = parseParametersBody(
        [bodyParam({ type: 'string' })],
        ['application/x-custom', 'application/pdf'],
      )
      expect(param?.type).toBe('Blob')
      expect(param?.mediaType).toBe('application/pdf')
    })

    it('全部 unknown consumes → 兜底走 schema', () => {
      const param = parseParametersBody(
        [bodyParam({ $ref: '#/definitions/User' })],
        ['application/x-custom', 'application/x-other'],
      )
      expect(param?.ref).toBe('User')
      expect(param?.mediaType).toBeUndefined()
    })
  })
})

describe('parseParametersBody (V2) - formData 参数聚合(模式 B)', () => {
  const formFileParam = { name: 'file', in: 'formData', type: 'file' }
  const formTextFieldParam = { name: 'name', in: 'formData', type: 'string' }

  it('formData 参数 + multipart/form-data consumes 应聚合成 FormData body', () => {
    const param = parseParametersBody(
      [formFileParam as any, formTextFieldParam as any],
      ['multipart/form-data'],
    )
    expect(param?.type).toBe('FormData')
    expect(param?.ref).toBe('FormData')
    expect(param?.mediaType).toBe('multipart/form-data')
    expect(param?.imports).toEqual([])
  })

  it('单一 formData 参数也应聚合', () => {
    const param = parseParametersBody(
      [formFileParam as any],
      ['multipart/form-data'],
    )
    expect(param?.type).toBe('FormData')
    expect(param?.mediaType).toBe('multipart/form-data')
  })

  it('formData 参数 + 无 consumes 应静默丢弃(决策 4-A,向后兼容)', () => {
    const param = parseParametersBody([formFileParam as any])
    expect(param).toBeUndefined()
  })

  it('formData 参数 + 非 multipart consumes(如 application/json)应静默丢弃', () => {
    const param = parseParametersBody(
      [formFileParam as any],
      ['application/json'],
    )
    expect(param).toBeUndefined()
  })

  it('body 参数与 formData 参数共存:body 优先(Swagger 规范禁止共存,做防御)', () => {
    const param = parseParametersBody(
      [
        bodyParam({ type: 'string' }) as any,
        formFileParam as any,
      ],
      ['multipart/form-data'],
    )
    // body 参数存在 → 按模式 A 处理(body + multipart → FormData)
    expect(param?.type).toBe('FormData')
    expect(param?.mediaType).toBe('multipart/form-data')
  })

  it('formData 参数不应被 parse-parameters-query 误捕获(回归)', async () => {
    const { parseParametersQuery } = await import('../../../src/parse/v2/parse-parameters-query')
    const result = parseParametersQuery([formFileParam as any])
    expect(result).toEqual([])
  })

  it('formData 参数不应被 parse-parameters-path 误捕获(回归)', async () => {
    const { parseParametersPath } = await import('../../../src/parse/v2/parse-parameters-path')
    const result = parseParametersPath([formFileParam as any])
    expect(result).toEqual([])
  })
})
