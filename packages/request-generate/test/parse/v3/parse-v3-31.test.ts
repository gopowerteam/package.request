import type { OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseV3 } from '../../../src/parse/v3'
import { parseSchemaType } from '../../../src/parse/v3/parse-schema-type'

/**
 * OpenAPI 3.1(JSON Schema 2020-12)解析兼容性
 * - 3.1 文档由 getOpenAPIVersion 按首字符路由到 parse/v3
 * - 差异集中在 Schema 层:type 数组 / boolean schema / const / $defs
 */
describe('parseSchemaType (V3.1) - type 数组与 nullable', () => {
  it('type: [string, "null"] → string | null', () => {
    const result = parseSchemaType({
      type: ['string', 'null'],
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('string | null')
  })

  it('type: [string, number] 多类型 → 联合', () => {
    const result = parseSchemaType({
      type: ['string', 'number'],
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('string | number')
  })

  it('type: [array, "null"] + $ref items → ref 为 User[] | null 且保留 import', () => {
    const result = parseSchemaType({
      type: ['array', 'null'],
      items: { $ref: '#/components/schemas/User' },
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('any[]')
    expect(result.ref).toBe('User[] | null')
    expect(result.imports).toEqual(['User'])
  })

  it('type: [array, "null"] + 内联 items → string[] | null', () => {
    const result = parseSchemaType({
      type: ['array', 'null'],
      items: { type: 'string' },
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('string[] | null')
  })

  it('元素自身可空时括号包裹,保证优先级正确', () => {
    const result = parseSchemaType({
      type: 'array',
      items: {
        type: ['string', 'null'],
      },
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('(string | null)[]')
  })
})

describe('parseSchemaType (V3.1) - boolean schema', () => {
  it('schema: true → any', () => {
    expect(parseSchemaType(true).type).toBe('any')
  })

  it('schema: false → never', () => {
    expect(parseSchemaType(false).type).toBe('never')
  })
})

describe('parseSchemaType (V3.1) - const 与枚举', () => {
  it('const: "x" → 单值枚举', () => {
    const result = parseSchemaType({ type: 'string', const: 'x' } as unknown as OpenAPIV3.SchemaObject)
    expect(result.enums).toEqual(['x'])
  })

  it('const: 42(number)→ 枚举字面量', () => {
    const result = parseSchemaType({ type: 'number', const: 42 } as unknown as OpenAPIV3.SchemaObject)
    expect(result.enums).toEqual(['42'])
  })

  it('const 为对象等非原始类型 → 忽略降级(不产生垃圾字面量)', () => {
    const result = parseSchemaType({
      type: 'object',
      const: { a: 1 },
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.enums).toBeUndefined()
  })

  it('nullable + enum → 枚举字面量折叠进 type(\'a\' | \'b\' | null)', () => {
    const result = parseSchemaType({
      type: 'string',
      enum: ['a', 'b'],
      nullable: true,
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('\'a\' | \'b\' | null')
    expect(result.enums).toBeUndefined()
  })
})

describe('parseSchemaType (V3.1) - $defs 引用降级', () => {
  it('嵌套 $defs 引用(#/components/schemas/Foo/$defs/Bar)→ 降级 any,无悬空 import', () => {
    const result = parseSchemaType({ $ref: '#/components/schemas/Foo/$defs/Bar' } as OpenAPIV3.ReferenceObject)
    expect(result.type).toBe('any')
    expect(result.ref).toBeUndefined()
    expect(result.imports).toBeUndefined()
  })

  it('根级 $defs 引用(#/$defs/X)→ 同样降级 any', () => {
    const result = parseSchemaType({ $ref: '#/$defs/X' } as unknown as OpenAPIV3.ReferenceObject)
    expect(result.type).toBe('any')
    expect(result.imports).toBeUndefined()
  })
})

describe('parseSchemaType (V3.1) - prefixItems 降级', () => {
  it('type: [array, "null"] + prefixItems(tuple)→ 降级 any[] | null', () => {
    const result = parseSchemaType({
      type: ['array', 'null'],
      prefixItems: [
        { type: 'string' },
        { type: 'number' },
      ],
    } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('any[] | null')
  })
})

describe('parseSchemaType (V3.0) - nullable 行为变更回归', () => {
  it('nullable: true → string | null(此前被静默忽略)', () => {
    const result = parseSchemaType({ type: 'string', nullable: true } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('string | null')
  })

  it('无 nullable → 行为不变', () => {
    const result = parseSchemaType({ type: 'string' } as unknown as OpenAPIV3.SchemaObject)
    expect(result.type).toBe('string')
  })
})

describe('parseV3 (V3.1) - 整体集成', () => {
  const doc = {
    openapi: '3.1.0',
    info: { title: 'demo', version: '1.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'listUsers',
          tags: ['user'],
          responses: {
            200: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: ['array', 'null'],
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: ['string', 'null'],
            },
            flag: true,
          },
        },
        Flag: true,
      },
    },
    // 3.1 新增顶层字段,应被忽略且不影响解析
    webhooks: {
      newUser: {
        post: {
          operationId: 'onNewUser',
          responses: {
            200: { description: 'ok' },
          },
        },
      },
    },
  } as unknown as OpenAPIV3.Document

  it('boolean model(components.schemas.Flag: true)→ 空字段模型,不崩溃', () => {
    const client = parseV3(doc)
    const flag = client.models.find(m => m.name === 'Flag')
    expect(flag).toBeDefined()
    expect(flag!.fields).toEqual([])
  })

  it('字段级 boolean schema → any;type 数组字段 → string | null', () => {
    const client = parseV3(doc)
    const user = client.models.find(m => m.name === 'User')
    const fieldByName = Object.fromEntries(user!.fields.map(f => [f.name, f]))
    expect(fieldByName.name!.type).toBe('string | null')
    expect(fieldByName.flag!.type).toBe('any')
  })

  it('响应 type 数组 → responseRef 为 User[] | null,webhooks 忽略不产出', () => {
    const client = parseV3(doc)
    expect(client.services).toHaveLength(1)
    const operation = client.services[0].operations[0]
    expect(operation.responseRef).toBe('User[] | null')
    expect(operation.imports).toContain('User')
  })
})
