import type { OpenAPIV2 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { parseSchemaType } from '../../../src/parse/v2/parse-schema-type'

describe('parseSchemaType (V2) - allOf/anyOf/oneOf 组合类型', () => {
  describe('allOf - $ref 组合(典型 Mixin / discriminator 场景)', () => {
    it('两个 $ref 子 schema 应合并 imports 并返回 any 类型', () => {
      const result = parseSchemaType({
        allOf: [
          { $ref: '#/definitions/User' },
          { $ref: '#/definitions/Timestamps' },
        ],
      })
      expect(result.type).toBe('any')
      expect(result.imports).toEqual(['User', 'Timestamps'])
    })

    it('ref 应使用 | 连接多个 $ref', () => {
      const result = parseSchemaType({
        allOf: [
          { $ref: '#/definitions/A' },
          { $ref: '#/definitions/B' },
        ],
      })
      expect(result.ref).toBe('A|B')
    })

    it('应正确剥离 #/definitions/ 命名空间', () => {
      const result = parseSchemaType({
        allOf: [{ $ref: '#/definitions/VeryLongModelName' }],
      })
      expect(result.imports).toEqual(['VeryLongModelName'])
    })
  })

  describe('anyOf - 内联基本类型联合', () => {
    it('两个内联基本类型应用 | 连接 type(注意 integer 经 getMappedType 映射为 number)', () => {
      const result = parseSchemaType({
        anyOf: [{ type: 'string' }, { type: 'integer' }],
      })
      expect(result.type).toBe('string|number')
      expect(result.ref).toBeUndefined()
      expect(result.imports).toBeUndefined()
    })
  })

  describe('oneOf - $ref 与内联混合', () => {
    it('应识别为 hasRef 分支,type 为 any,imports 收集 $ref', () => {
      const result = parseSchemaType({
        oneOf: [
          { $ref: '#/definitions/Pet' },
          { type: 'string' },
        ],
      })
      expect(result.type).toBe('any')
      expect(result.imports).toEqual(['Pet'])
    })
  })

  describe('imports 去重', () => {
    it('两个相同 $ref 应只产生一个 import', () => {
      const result = parseSchemaType({
        allOf: [
          { $ref: '#/definitions/User' },
          { $ref: '#/definitions/User' },
        ],
      })
      expect(result.imports).toEqual(['User'])
    })
  })

  describe('与现有分支的优先级', () => {
    it('allOf 存在时应跳过 NonArraySchemaObjectType 分支(即使 type 字段存在)', () => {
      // 现有 NonArray 分支条件已含 !schema.allOf,所以会正确跳过
      const result = parseSchemaType({
        type: 'object',
        allOf: [{ $ref: '#/definitions/Mixin' }],
      } as OpenAPIV2.SchemaObject)
      expect(result.imports).toEqual(['Mixin'])
      expect(result.type).toBe('any')
    })

    it('allOf 存在时应优先于 object 兜底分支(V2 独有分支顺序问题)', () => {
      // 关键回归:新分支必须插在 object 兜底之前,否则 allOf 会被静默丢弃
      const result = parseSchemaType({
        type: 'object',
        allOf: [{ $ref: '#/definitions/Mixin' }],
      } as OpenAPIV2.SchemaObject)
      expect(result.imports).toEqual(['Mixin'])
      expect(result.type).toBe('any')
      expect(result.ref).toBe('Mixin')
    })
  })

  describe('object 类型解析(由 NonArray 分支处理,不经 object 兜底)', () => {
    it('{ type: "object" } 无 properties 应通过 NonArray 分支返回 type=any', () => {
      // 关键回归:确认 object 兜底分支是死代码(决策 1-X)
      // 删除 object 兜底后此用例仍应通过,因为 NonArray 已处理
      const result = parseSchemaType({ type: 'object' })
      expect(result.type).toBe('any')
      // ref 为 undefined:V2 parse-operation.ts 用 ref || 'void' 兜底
      expect(result.ref).toBeUndefined()
    })

    it('{ type: "object", properties: {...} } 应同样走 NonArray(不依赖 properties)', () => {
      // NonArray 不检查 properties,只要 type 是 string 且无 allOf/anyOf/oneOf 就命中
      const result = parseSchemaType({
        type: 'object',
        properties: { id: { type: 'string' } },
      })
      expect(result.type).toBe('any')
      expect(result.ref).toBeUndefined()
    })
  })
})
