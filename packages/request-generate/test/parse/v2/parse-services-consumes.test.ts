import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseV2 } from '../../../src/parse/v2'

describe('parseV2 - document.consumes 与 operation.consumes 优先级', () => {
  it('operation.consumes 应优先于 document.consumes', () => {
    const doc: OpenAPIV2.Document = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      consumes: ['application/json'],
      paths: {
        '/upload': {
          post: {
            operationId: 'upload',
            tags: ['file'],
            consumes: ['application/pdf'],
            parameters: [
              { name: 'body', in: 'body', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    }
    const client = parseV2(doc)
    const op = client.services[0].operations[0]
    expect(op.parametersBody?.type).toBe('Blob')
    expect(op.parametersBody?.mediaType).toBe('application/pdf')
  })

  it('operation.consumes 缺失时回退到 document.consumes', () => {
    const doc: OpenAPIV2.Document = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      consumes: ['application/octet-stream'],
      paths: {
        '/upload': {
          post: {
            operationId: 'upload',
            tags: ['file'],
            parameters: [
              { name: 'body', in: 'body', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
    }
    const client = parseV2(doc)
    const op = client.services[0].operations[0]
    expect(op.parametersBody?.type).toBe('Blob')
    expect(op.parametersBody?.mediaType).toBe('application/octet-stream')
  })

  it('两者都缺失时走现有 schema 派生行为', () => {
    const doc: OpenAPIV2.Document = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/users': {
          post: {
            operationId: 'create',
            tags: ['user'],
            parameters: [
              { name: 'body', in: 'body', schema: { $ref: '#/definitions/User' } },
            ],
            responses: { 200: { description: 'OK' } },
          },
        },
      },
      definitions: {
        User: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    }
    const client = parseV2(doc)
    const op = client.services[0].operations[0]
    expect(op.parametersBody?.ref).toBe('User')
    expect(op.parametersBody?.mediaType).toBeUndefined()
  })
})
