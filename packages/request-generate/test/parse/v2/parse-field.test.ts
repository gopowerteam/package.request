import { describe, expect, it } from 'vitest'
import { parseField } from '../../../src/parse/v2/parse-field'

describe('parseField (V2) - 字段解析', () => {
  it('简单类型字段应正确解析', () => {
    const field = parseField('name', { type: 'string' }, true)
    expect(field.name).toBe('name')
    expect(field.required).toBe(true)
    expect(field.type).toBe('string')
  })

  it('integer 类型字段应映射为 number', () => {
    const field = parseField('age', { type: 'integer' }, false)
    expect(field.type).toBe('number')
    expect(field.required).toBe(false)
  })

  it('$ref 字段应收集 imports', () => {
    const field = parseField('user', { $ref: '#/definitions/User' }, false)
    expect(field.type).toBe('any')
    expect(field.imports).toContain('User')
  })

  it('description 字段透传(仅非 $ref schema)', () => {
    const field = parseField('name', {
      type: 'string',
      description: '用户名称',
    }, false)
    expect(field.description).toBe('用户名称')
  })

  it('$ref 字段不透传 description(避免访问 $ref schema 的属性)', () => {
    const field = parseField('user', { $ref: '#/definitions/User' }, false)
    expect(field.description).toBeUndefined()
  })

  it('enum 字段透传', () => {
    const field = parseField('status', {
      type: 'string',
      enum: ['active', 'inactive'],
    }, false)
    expect(field.enums).toEqual(['active', 'inactive'])
  })

  it('数组字段应正确解析', () => {
    const field = parseField('tags', {
      type: 'array',
      items: { type: 'string' },
    }, false)
    expect(field.type).toBe('string[]')
  })

  it('数组 $ref 字段应收集 imports', () => {
    const field = parseField('roles', {
      type: 'array',
      items: { $ref: '#/definitions/Role' },
    }, false)
    expect(field.type).toBe('any[]')
    expect(field.imports).toContain('Role')
  })
})
