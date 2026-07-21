import { describe, expect, it } from 'vitest'
import { parseOperation } from '../../../src/parse/v2/parse-operation'

/**
 * Response 侧测试
 *
 * 通过 parseOperation 间接测试 parseResponseType,
 * 因为 parseResponseType 是 parse-operation.ts 的私有函数。
 * 与 V3 parse-response.test.ts 模式一致。
 */

describe('parseOperation (V2) - Response 解析', () => {
  describe('schema 响应', () => {
    it('$ref schema 应解析为对应 Model ref', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        tags: ['user'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true } as any,
        ],
        responses: {
          200: {
            description: 'OK',
            schema: { $ref: '#/definitions/User' },
          },
        },
      })
      expect(op.responseRef).toBe('User')
      expect(op.imports).toContain('User')
    })

    it('内联 schema(string)应派生为 string 类型', () => {
      const op = parseOperation('/health', 'get', {
        operationId: 'health',
        tags: ['system'],
        responses: {
          200: {
            description: 'OK',
            schema: { type: 'string' },
          },
        },
      })
      expect(op.responseRef).toBe('string')
    })

    it('内联 schema(integer)应派生为 number 类型', () => {
      const op = parseOperation('/count', 'get', {
        operationId: 'count',
        tags: ['system'],
        responses: {
          200: {
            description: 'OK',
            schema: { type: 'integer' },
          },
        },
      })
      expect(op.responseRef).toBe('number')
    })

    it('内联 schema(boolean)应派生为 boolean 类型', () => {
      const op = parseOperation('/exists', 'get', {
        operationId: 'exists',
        tags: ['system'],
        responses: {
          200: {
            description: 'OK',
            schema: { type: 'boolean' },
          },
        },
      })
      expect(op.responseRef).toBe('boolean')
    })

    it('内联 array schema(基本类型 items)应派生为类型数组', () => {
      const op = parseOperation('/tags', 'get', {
        operationId: 'listTags',
        tags: ['system'],
        responses: {
          200: {
            description: 'OK',
            schema: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      })
      expect(op.responseRef).toBe('string[]')
    })

    it('内联 array schema($ref items)应派生为 Model[]', () => {
      const op = parseOperation('/users', 'get', {
        operationId: 'listUsers',
        tags: ['user'],
        responses: {
          200: {
            description: 'OK',
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/User' },
            },
          },
        },
      })
      expect(op.responseRef).toBe('User[]')
      expect(op.imports).toContain('User')
    })

    it('内联 object schema 应派生为 any', () => {
      const op = parseOperation('/raw', 'get', {
        operationId: 'raw',
        tags: ['system'],
        responses: {
          200: {
            description: 'OK',
            schema: { type: 'object' },
          },
        },
      })
      expect(op.responseRef).toBe('any')
    })
  })

  describe('$ref 响应(整体响应是 $ref)', () => {
    it('response.$ref 应走 parseSchemaType', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        tags: ['user'],
        responses: {
          200: { $ref: '#/responses/UserResponse' },
        },
      })
      expect(op.responseRef).toBe('UserResponse')
      expect(op.imports).toContain('UserResponse')
    })
  })

  describe('void 兜底', () => {
    it('无 schema 的 200 响应应返回 void', () => {
      const op = parseOperation('/ping', 'get', {
        operationId: 'ping',
        tags: ['system'],
        responses: {
          200: { description: 'OK' },
        },
      })
      expect(op.responseRef).toBe('void')
    })

    it('无 200 响应应返回 void', () => {
      const op = parseOperation('/ping', 'get', {
        operationId: 'ping',
        tags: ['system'],
        responses: {
          404: { description: 'Not Found' },
        },
      })
      expect(op.responseRef).toBe('void')
    })

    it('responses 为空对象应返回 void', () => {
      const op = parseOperation('/ping', 'get', {
        operationId: 'ping',
        tags: ['system'],
        responses: {} as any,
      })
      expect(op.responseRef).toBe('void')
    })
  })

  describe('imports 收集', () => {
    it('response 的 imports 应进入 operation.imports', () => {
      const op = parseOperation('/users/{id}', 'get', {
        operationId: 'getUser',
        tags: ['user'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true } as any,
        ],
        responses: {
          200: {
            description: 'OK',
            schema: { $ref: '#/definitions/User' },
          },
        },
      })
      expect(op.imports).toContain('User')
    })

    it('body 与 response 同时含 $ref 时 imports 应合并去重', () => {
      const op = parseOperation('/users', 'post', {
        operationId: 'createUser',
        tags: ['user'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            schema: { $ref: '#/definitions/User' },
          } as any,
        ],
        responses: {
          200: {
            description: 'OK',
            schema: { $ref: '#/definitions/User' },
          },
        },
      })
      // body 与 response 都引用 User,imports 去重后应只有 1 个 User
      const userImports = op.imports.filter(m => m === 'User')
      expect(userImports).toHaveLength(1)
    })
  })
})
