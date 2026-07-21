import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseV2 } from '../../../src/parse/v2'

describe('parseV2 - formData 端到端(模式 B)', () => {
  it('典型文件上传 spec 应生成 FormData body', () => {
    const doc: OpenAPIV2.Document = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/upload': {
          post: {
            operationId: 'uploadAvatar',
            tags: ['file'],
            consumes: ['multipart/form-data'],
            parameters: [
              { name: 'file', in: 'formData', type: 'file', required: true },
              { name: 'description', in: 'formData', type: 'string' },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    }
    const client = parseV2(doc)
    const op = client.services[0].operations[0]
    expect(op.parametersBody?.type).toBe('FormData')
    expect(op.parametersBody?.mediaType).toBe('multipart/form-data')
    // query/path 参数不应包含 formData(回归保护)
    expect(op.parametersQuery).toEqual([])
    expect(op.parametersPath).toEqual([])
  })

  it('formData + 无 consumes 应静默丢弃(决策 4-A)', () => {
    const doc: OpenAPIV2.Document = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/upload': {
          post: {
            operationId: 'broken',
            tags: ['file'],
            // 缺少 consumes(规范错误,但需向后兼容)
            parameters: [
              { name: 'file', in: 'formData', type: 'file' },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    }
    const client = parseV2(doc)
    const op = client.services[0].operations[0]
    expect(op.parametersBody).toBeUndefined()
    expect(op.parametersQuery).toEqual([])
    expect(op.parametersPath).toEqual([])
  })
})
