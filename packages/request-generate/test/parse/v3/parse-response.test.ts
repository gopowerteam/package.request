import type { OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseOperation } from '../../../src/parse/v3/parse-operation'

/**
 * Response 侧多 media 类型支持测试
 *
 * 通过 parseOperation 间接测试 parseResponseType,
 * 因为 parseResponseType 是 parse-operation.ts 的私有函数。
 */

describe('parseOperation (V3) - Response 多 media 类型支持', () => {
  describe('jSON 家族', () => {
    it('application/json 含 $ref schema 时正常解析', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        tags: ['user'],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      })
      expect(op.responseRef).toBe('User')
      expect(op.imports).toContain('User')
    })

    it('application/json; charset=utf-8 应被识别为 JSON 家族(原 bug 修复)', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json; charset=utf-8': {
                schema: { type: 'string' },
              },
            },
          },
        },
      })
      expect(op.responseRef).toBe('string')
    })

    it('application/problem+json (RFC 7807) 应被识别为 JSON 家族', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Error')
    })

    it('application/vnd.github.v3+json 应被识别为 JSON 家族', () => {
      const op = parseOperation('/repo', 'get', {
        operationId: 'getRepo',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/vnd.github.v3+json': {
                schema: { $ref: '#/components/schemas/Repo' },
              },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Repo')
    })

    it('*/* media 应按 JSON 解析 schema', () => {
      const op = parseOperation('/any', 'get', {
        operationId: 'getAny',
        responses: {
          200: {
            description: 'OK',
            content: {
              '*/*': { schema: { $ref: '#/components/schemas/Any' } },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Any')
    })
  })

  describe('非 JSON media → 整体类型映射', () => {
    it('application/pdf 应映射为 Blob', () => {
      const op = parseOperation('/report.pdf', 'get', {
        operationId: 'downloadReport',
        responses: {
          200: {
            description: 'PDF binary',
            content: {
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Blob')
    })

    it('application/octet-stream 应映射为 Blob', () => {
      const op = parseOperation('/file', 'get', {
        operationId: 'downloadFile',
        responses: {
          200: {
            description: 'binary',
            content: { 'application/octet-stream': {} },
          },
        },
      })
      expect(op.responseRef).toBe('Blob')
    })

    it('image/png 应映射为 Blob', () => {
      const op = parseOperation('/avatar.png', 'get', {
        operationId: 'getAvatar',
        responses: {
          200: {
            description: 'image',
            content: { 'image/png': {} },
          },
        },
      })
      expect(op.responseRef).toBe('Blob')
    })

    it('text/csv 应映射为 string', () => {
      const op = parseOperation('/export.csv', 'get', {
        operationId: 'exportCsv',
        responses: {
          200: {
            description: 'csv',
            content: {
              'text/csv': { schema: { type: 'string' } },
            },
          },
        },
      })
      expect(op.responseRef).toBe('string')
    })

    it('text/plain 应映射为 string', () => {
      const op = parseOperation('/health', 'get', {
        operationId: 'health',
        responses: {
          200: {
            description: 'ok',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
        },
      })
      expect(op.responseRef).toBe('string')
    })
  })

  describe('优先级与回退', () => {
    it('jSON 优先于其他 media(多 media 共存时)', () => {
      const op = parseOperation('/data', 'get', {
        operationId: 'getData',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
              'application/json': { schema: { $ref: '#/components/schemas/Data' } },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Data')
    })

    it('未知 media 有 schema 时应回退解析 schema', () => {
      const op = parseOperation('/custom', 'get', {
        operationId: 'getCustom',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/x-custom': {
                schema: { $ref: '#/components/schemas/Custom' },
              },
            },
          },
        },
      })
      expect(op.responseRef).toBe('Custom')
    })

    it('未知 media 无 schema 时应回退为 any', () => {
      const op = parseOperation('/custom', 'get', {
        operationId: 'getCustom',
        responses: {
          200: {
            description: 'OK',
            content: { 'application/x-custom': {} },
          },
        },
      })
      expect(op.responseRef).toBe('any')
    })
  })

  describe('无内容响应', () => {
    it('无 200 响应时应返回 void', () => {
      const op = parseOperation('/foo', 'post', {
        operationId: 'createFoo',
        responses: {
          201: { description: 'Created' },
        },
      })
      expect(op.responseRef).toBe('void')
    })

    it('responses 为空对象时应返回 void', () => {
      const op = parseOperation('/foo', 'get', {
        operationId: 'noop',
        responses: {},
      })
      expect(op.responseRef).toBe('void')
    })

    it('204 No Content 风格(无 content 字段)应返回 void', () => {
      const op = parseOperation('/foo', 'delete', {
        operationId: 'deleteFoo',
        responses: {
          204: { description: 'No Content' },
        },
      })
      // 204 不是 200,所以会走"无 200 响应"分支
      expect(op.responseRef).toBe('void')
    })

    it('200 响应但 content 为空对象时应返回 void', () => {
      const op = parseOperation('/foo', 'get', {
        operationId: 'getFoo',
        responses: {
          200: {
            description: 'OK',
            content: {},
          },
        },
      })
      expect(op.responseRef).toBe('void')
    })

    it('200 响应但无 content 字段时应返回 void', () => {
      const op = parseOperation('/foo', 'get', {
        operationId: 'getFoo',
        responses: {
          200: { description: 'OK' } as OpenAPIV3.ResponseObject,
        },
      })
      expect(op.responseRef).toBe('void')
    })
  })

  describe('$ref 响应', () => {
    it('response.$ref 应直接走 parseSchemaType(与 V2 行为对齐)', () => {
      const op = parseOperation('/foo', 'get', {
        operationId: 'getFoo',
        responses: {
          200: { $ref: '#/components/responses/StandardResponse' },
        },
      })
      expect(op.responseRef).toBe('StandardResponse')
      expect(op.imports).toContain('StandardResponse')
    })
  })
})
