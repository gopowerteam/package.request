import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseModel } from '../../../src/parse/v2/parse-model'

describe('parseModel (V2) - model 解析', () => {
  it('基础 model 应含正确字段', () => {
    const model = parseModel('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    } as OpenAPIV2.SchemaObject)
    expect(model.name).toBe('User')
    expect(model.fields).toHaveLength(2)
    expect(model.fields.map(f => f.name)).toEqual(['id', 'name'])
  })

  it('required 字段透传到 field', () => {
    const model = parseModel('User', {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    } as OpenAPIV2.SchemaObject)
    const idField = model.fields.find(f => f.name === 'id')
    const nameField = model.fields.find(f => f.name === 'name')
    expect(idField?.required).toBe(true)
    expect(nameField?.required).toBe(false)
  })

  it('嵌套 $ref imports 收集', () => {
    const model = parseModel('Order', {
      type: 'object',
      properties: {
        user: { $ref: '#/definitions/User' },
        product: { $ref: '#/definitions/Product' },
      },
    } as OpenAPIV2.SchemaObject)
    expect(model.imports).toContain('User')
    expect(model.imports).toContain('Product')
  })

  it('imports 去重(两个字段引用同一 model)', () => {
    const model = parseModel('Order', {
      type: 'object',
      properties: {
        buyer: { $ref: '#/definitions/User' },
        seller: { $ref: '#/definitions/User' },
      },
    } as OpenAPIV2.SchemaObject)
    expect(model.imports.filter(m => m === 'User')).toHaveLength(1)
  })

  it('自引用过滤(User model 不应出现在自己的 imports 里)', () => {
    // 关键不变量:防止循环依赖
    const model = parseModel('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        parent: { $ref: '#/definitions/User' }, // 自引用
        friend: { $ref: '#/definitions/User' }, // 自引用
      },
    } as OpenAPIV2.SchemaObject)
    expect(model.imports).not.toContain('User')
  })

  it('无 properties 的 model 应返回空 fields 数组', () => {
    const model = parseModel('Empty', {
      type: 'object',
    } as OpenAPIV2.SchemaObject)
    expect(model.fields).toEqual([])
    expect(model.imports).toEqual([])
  })

  it('无 type 字段的 schema 也应正常处理(走 properties 兜底)', () => {
    // parseFields 只读 properties,不依赖 type 字段
    const model = parseModel('Loose', {
      properties: { id: { type: 'string' } },
    } as OpenAPIV2.SchemaObject)
    expect(model.fields).toHaveLength(1)
    expect(model.fields[0].name).toBe('id')
  })
})
