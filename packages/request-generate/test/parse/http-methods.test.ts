import { describe, expect, it } from 'vitest'
import { HTTP_METHODS, isHttpMethod } from '../../src/parse/http-methods'

describe('http-methods - HTTP 方法识别', () => {
  it('应识别标准 HTTP 方法(大小写不敏感)', () => {
    for (const method of ['get', 'GET', 'Get', 'post', 'Post', 'delete', 'put', 'patch', 'options', 'head', 'trace']) {
      expect(isHttpMethod(method)).toBe(true)
    }
  })

  it('应拒绝非 HTTP 方法字段', () => {
    for (const key of ['parameters', 'summary', 'description', 'servers', '$ref', 'operationId', '']) {
      expect(isHttpMethod(key)).toBe(false)
    }
  })

  it('hTTP_METHODS 集合应包含全部 8 个 RFC 方法', () => {
    expect(HTTP_METHODS.size).toBe(8)
    expect([...HTTP_METHODS].sort()).toEqual(
      ['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'],
    )
  })
})
