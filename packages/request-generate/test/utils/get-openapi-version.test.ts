import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import { describe, expect, it } from 'vitest'
import { OpenAPIVersion } from '../../src/config/enum.config'
import { getOpenAPIVersion } from '../../src/utils/get-openapi-version'

type UnknownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

function asDocument(value: unknown): UnknownVersionDocument {
  return value as UnknownVersionDocument
}

describe('getOpenAPIVersion - 版本探测', () => {
  it('swagger: 2.0 应识别为 V2', () => {
    expect(getOpenAPIVersion(asDocument({ swagger: '2.0' }))).toBe(OpenAPIVersion.V2)
  })

  it('openapi: 3.0.0 应识别为 V3', () => {
    expect(getOpenAPIVersion(asDocument({ openapi: '3.0.0' }))).toBe(OpenAPIVersion.V3)
  })

  it('swagger 与 openapi 同时存在时 swagger 优先', () => {
    expect(getOpenAPIVersion(asDocument({ swagger: '2.0', openapi: '3.0.0' }))).toBe(
      OpenAPIVersion.V2,
    )
  })

  it('仅取主版本号(忽略次版本)', () => {
    expect(getOpenAPIVersion(asDocument({ swagger: '2.9' }))).toBe(OpenAPIVersion.V2)
    expect(getOpenAPIVersion(asDocument({ openapi: '3.1.0' }))).toBe(OpenAPIVersion.V3)
  })

  it('不支持的旧版本应抛出明确错误', () => {
    expect(() => getOpenAPIVersion(asDocument({ swagger: '1.2' }))).toThrow(
      '无法识别的OPENAPI版本: "1.2"',
    )
  })

  it('未来大版本应抛出明确错误', () => {
    expect(() => getOpenAPIVersion(asDocument({ openapi: '4.0.1' }))).toThrow(
      '无法识别的OPENAPI版本: "4.0.1"',
    )
  })

  it('缺少版本字段时应抛出明确错误', () => {
    expect(() => getOpenAPIVersion(asDocument({}))).toThrow(
      '无法识别的OPENAPI版本: "undefined"',
    )
  })

  it('版本字段为数字时应抛出明确错误(仅接受字符串)', () => {
    expect(() => getOpenAPIVersion(asDocument({ openapi: 3 }))).toThrow(
      '无法识别的OPENAPI版本: "3"',
    )
  })

  it('document 为 null 时应抛出明确错误', () => {
    expect(() => getOpenAPIVersion(asDocument(null))).toThrow(
      '无法识别的OPENAPI版本: "undefined"',
    )
  })
})
