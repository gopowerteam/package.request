import type { OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseParametersBody } from '../../../src/parse/v3/parse-parameters-body'

const ctx = { path: '/foo', method: 'post', operationId: 'doFoo' }

describe('parseParametersBody (V3) - media 类型匹配', () => {
  describe('jSON 家族', () => {
    it('application/json 含 $ref schema 时正常解析', () => {
      const param = parseParametersBody(
        {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.ref).toBe('User')
      expect(param.imports).toContain('User')
      expect(param.mediaType).toBeUndefined()
    })

    it('application/json; charset=utf-8 应被识别为 JSON 家族', () => {
      // 旧实现会漏匹配并最终抛错
      const param = parseParametersBody(
        {
          content: {
            'application/json; charset=utf-8': {
              schema: { type: 'string' },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('string')
      expect(param.mediaType).toBeUndefined()
    })

    it('application/problem+json 应被识别为 JSON 家族', () => {
      const param = parseParametersBody(
        {
          content: {
            'application/problem+json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.ref).toBe('Error')
      expect(param.imports).toContain('Error')
      expect(param.mediaType).toBeUndefined()
    })

    it('*/* media 应按 JSON 解析 schema', () => {
      const param = parseParametersBody(
        {
          content: {
            '*/*': { schema: { $ref: '#/components/schemas/Anything' } },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.ref).toBe('Anything')
      expect(param.mediaType).toBeUndefined()
    })
  })

  describe('非 JSON media → 整体类型映射', () => {
    it('multipart/form-data 应映射为 FormData(忽略内部 schema)', () => {
      // 当前 playground 报告的 bug:文件上传接口
      const param = parseParametersBody(
        {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('FormData')
      expect(param.ref).toBe('FormData')
      expect(param.imports).toEqual([])
      expect(param.mediaType).toBe('multipart/form-data')
    })

    it('application/octet-stream 无 schema 时应映射为 Blob', () => {
      const param = parseParametersBody(
        {
          content: { 'application/octet-stream': {} },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('Blob')
      expect(param.ref).toBe('Blob')
      expect(param.mediaType).toBe('application/octet-stream')
    })

    it('application/octet-stream 有 schema 时也应映射为 Blob', () => {
      const param = parseParametersBody(
        {
          content: {
            'application/octet-stream': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('Blob')
      expect(param.mediaType).toBe('application/octet-stream')
    })

    it('application/x-www-form-urlencoded 应映射为 URLSearchParams', () => {
      const param = parseParametersBody(
        {
          content: {
            'application/x-www-form-urlencoded': { schema: { type: 'object' } },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('URLSearchParams')
      expect(param.mediaType).toBe('application/x-www-form-urlencoded')
    })

    it('text/plain 应映射为 string', () => {
      const param = parseParametersBody(
        {
          content: { 'text/plain': { schema: { type: 'string' } } },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('string')
      expect(param.mediaType).toBe('text/plain')
    })

    it('image/png 应映射为 Blob', () => {
      const param = parseParametersBody(
        {
          content: { 'image/png': {} },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('Blob')
      expect(param.mediaType).toBe('image/png')
    })
  })

  describe('优先级与回退', () => {
    it('jSON 优先于其他 media(多 media 共存时)', () => {
      const param = parseParametersBody(
        {
          content: {
            'multipart/form-data': { schema: { type: 'object' } },
            'application/json': { schema: { $ref: '#/components/schemas/Payload' } },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.ref).toBe('Payload')
      // JSON 家族命中 → mediaType 不写入,模板走 axios 实例默认
      expect(param.mediaType).toBeUndefined()
    })

    it('未知 media 有 schema 时应回退解析 schema', () => {
      const param = parseParametersBody(
        {
          content: {
            'application/x-custom': {
              schema: { $ref: '#/components/schemas/Custom' },
            },
          },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.ref).toBe('Custom')
      // 未知 media 兜底走 schema → 不注入 headers(JSON 默认)
      expect(param.mediaType).toBeUndefined()
    })

    it('未知 media 无 schema 时应回退为 any', () => {
      const param = parseParametersBody(
        {
          content: { 'application/x-custom': {} },
        } as OpenAPIV3.RequestBodyObject,
        ctx,
      )
      expect(param.type).toBe('any')
      expect(param.mediaType).toBeUndefined()
    })
  })

  describe('$ref requestBody', () => {
    it('应直接走 parseSchemaType 解析引用', () => {
      const param = parseParametersBody(
        { $ref: '#/components/requestBodies/UserBody' },
        ctx,
      )
      expect(param.ref).toBe('UserBody')
      expect(param.imports).toContain('UserBody')
      // $ref 不经过 media-type 分类 → 无 mediaType(JSON 默认)
      expect(param.mediaType).toBeUndefined()
    })
  })

  describe('错误信息含上下文', () => {
    it('content 为空对象时抛错含 path/method/operationId', () => {
      expect(() =>
        parseParametersBody({ content: {} } as OpenAPIV3.RequestBodyObject, ctx),
      ).toThrow(
        /\[V3 RequestBody 解析失败\] POST \/foo "doFoo": RequestBody\.content 为空对象/,
      )
    })

    it('缺少 content 字段时抛错含上下文', () => {
      expect(() =>
        parseParametersBody({} as OpenAPIV3.RequestBodyObject, ctx),
      ).toThrow(/requestBody 缺少 content 字段/)
    })

    it('operationId 缺省时错误信息应仍含 method 与 path', () => {
      expect(() =>
        parseParametersBody(
          {} as OpenAPIV3.RequestBodyObject,
          { path: '/bar', method: 'put' },
        ),
      ).toThrow(/\[V3 RequestBody 解析失败\] PUT \/bar:/)
    })
  })
})
