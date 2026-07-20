import type { OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseOperation } from '../../../src/parse/v3/parse-operation'
import { parseSchemaType } from '../../../src/parse/v3/parse-schema-type'
import v3Minimal from '../../fixtures/v3-minimal.json'

describe('parseOperation (V3) - response.$ref 修复', () => {
  it('应正确解析 200 响应里的 $ref', () => {
    // 旧实现错误地把整个 responses 对象传给 parseSchemaType,
    // 触发 "无法解析相应的schema" 异常并被 exit(0) 吞掉
    const operation = parseOperation('/users', 'post', {
      operationId: 'createUser',
      tags: ['user'],
      summary: 'Create user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      responses: {
        200: { $ref: '#/components/responses/UserResponse' },
      },
    })

    // 修复后不再抛出,且会经过 stripNamespace 提取出 UserResponse
    expect(operation.responseRef).toBe('UserResponse')
    expect(operation.imports).toContain('UserResponse')
  })

  it('应正确解析 application/json 内联 schema 的响应', () => {
    const operation = parseOperation('/users', 'get', {
      operationId: 'listUsers',
      tags: ['user'],
      parameters: [
        { name: 'page', in: 'query', required: false, schema: { type: 'integer' } },
      ],
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    })

    expect(operation.responseRef).toBe('User[]')
    expect(operation.imports).toContain('User')
    expect(operation.parametersQuery[0].name).toBe('page')
  })

  it('无 200 响应时 responseRef 应为 void', () => {
    const operation = parseOperation('/foo', 'get', {
      operationId: 'noop',
      responses: {},
    })

    expect(operation.responseRef).toBe('void')
  })
})

describe('parseSchemaType (V3) - 边界与错误信息', () => {
  it('schema.type === "array" 但缺少 items 时不应抛 TypeError', () => {
    // 畸形 spec:声明 array 但没有 items 字段
    // 旧实现直接访问 schema.items.$ref 会抛 cryptic TypeError
    // 修复后 fallthrough 到最终错误,信息中包含 schema 内容
    expect(() =>
      parseSchemaType({ type: 'array' } as OpenAPIV3.SchemaObject),
    ).toThrow(/无法解析相应的schema/)
  })

  it('错误信息应包含 schema 内容片段以便排查', () => {
    try {
      parseSchemaType({ type: 'array' } as OpenAPIV3.SchemaObject)
      expect.unreachable('应抛出异常')
    }
    catch (error) {
      expect((error as Error).message).toContain('"type":"array"')
    }
  })

  it('allOf 中带 $ref 时应合并到 ref 链', () => {
    const result = parseSchemaType({
      allOf: [{ $ref: '#/components/schemas/A' }, { $ref: '#/components/schemas/B' }],
    } as OpenAPIV3.SchemaObject)

    expect(result.ref).toBe('A|B')
    expect(result.imports).toEqual(['A', 'B'])
  })
})

describe('parseV3 整体 - HTTP 方法过滤与 components.schemas 守卫', () => {
  it('pathItemObject 的 parameters 字段不应被当成 operation', async () => {
    const { parseV3 } = await import('../../../src/parse/v3')
    const client = parseV3(v3Minimal as OpenAPIV3.Document)

    // fixture 中只有 user 标签,且只有 3 个真实 HTTP 方法
    // 若不过滤 parameters/summary/description 等,会生成名为 Parameters/Summary 的 service
    const serviceNames = client.services.map(s => s.name)
    expect(serviceNames).toEqual(['User'])
    expect(serviceNames).not.toContain('Parameters')
    expect(serviceNames).not.toContain('Summary')

    // 应有 3 个 operation( getUsers / createUser / getUser )
    expect(client.services[0].operations).toHaveLength(3)
  })

  it('document.components 存在但 schemas 缺失时不应崩溃', async () => {
    const { parseV3 } = await import('../../../src/parse/v3')
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {},
      components: {},
    } as unknown as OpenAPIV3.Document

    expect(() => parseV3(doc)).not.toThrow()
    const client = parseV3(doc)
    expect(client.models).toEqual([])
  })
})
