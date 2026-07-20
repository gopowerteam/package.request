import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseSchemaType } from '../../../src/parse/v2/parse-schema-type'
import v2Minimal from '../../fixtures/v2-minimal.json'

describe('parseV2 整体 - HTTP 方法过滤', () => {
  it('pathItemObject 的 parameters 字段不应被当成 operation', async () => {
    const { parseV2 } = await import('../../../src/parse/v2')
    const client = parseV2(v2Minimal as OpenAPIV2.Document)

    const serviceNames = client.services.map(s => s.name)
    expect(serviceNames).toEqual(['User'])
    expect(serviceNames).not.toContain('Parameters')

    expect(client.services[0].operations).toHaveLength(3)
    expect(client.models[0].name).toBe('User')
    expect(client.models[0].fields.map(f => f.name)).toEqual([
      'id',
      'name',
      'age',
      'roles',
    ])
  })

  it('definitions 缺失时应返回空数组', async () => {
    const { parseV2 } = await import('../../../src/parse/v2')
    const doc = {
      swagger: '2.0',
      info: { title: 'x', version: '1' },
      paths: {},
    } as unknown as OpenAPIV2.Document

    expect(() => parseV2(doc)).not.toThrow()
    expect(parseV2(doc).models).toEqual([])
  })
})

describe('parseSchemaType (V2) - 错误信息', () => {
  it('错误信息应包含 schema 内容片段', () => {
    try {
      // array 类型缺少 items,应落到最终的 throw 分支
      parseSchemaType({ type: 'array' } as OpenAPIV2.SchemaObject)
      expect.unreachable('应抛出异常')
    }
    catch (error) {
      expect((error as Error).message).toContain('无法解析相应的schema')
      expect((error as Error).message).toContain('"type":"array"')
    }
  })
})
