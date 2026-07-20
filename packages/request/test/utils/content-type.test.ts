import { describe, expect, it } from 'vitest'
import {
  hasContentTypeHeader,
  isBlob,
  isFormData,
  isURLSearchParams,
} from '../../src/utils/content-type'

describe('hasContentTypeHeader - 检测调用方是否已设置 Content-Type', () => {
  it('content-Type 大写形式应识别', () => {
    expect(hasContentTypeHeader({ 'Content-Type': 'application/json' })).toBe(true)
  })

  it('content-type 小写形式应识别', () => {
    expect(hasContentTypeHeader({ 'content-type': 'application/json' })).toBe(true)
  })

  it('混合大小写应识别', () => {
    expect(hasContentTypeHeader({ 'CoNtEnT-TyPe': 'text/plain' })).toBe(true)
  })

  it('不含 Content-Type 应返回 false', () => {
    expect(hasContentTypeHeader({})).toBe(false)
    expect(hasContentTypeHeader({ Accept: 'application/json' })).toBe(false)
  })
})

describe('isFormData - 判定 FormData 实例', () => {
  it('formData 实例应返回 true', () => {
    const fd = new FormData()
    fd.append('x', '1')
    expect(isFormData(fd)).toBe(true)
  })

  it('普通对象应返回 false', () => {
    expect(isFormData({})).toBe(false)
    expect(isFormData({ append: 'not a function' })).toBe(false)
  })

  it('null/undefined 应返回 false', () => {
    expect(isFormData(null)).toBe(false)
    expect(isFormData(undefined)).toBe(false)
  })
})

describe('isURLSearchParams - 判定 URLSearchParams 实例', () => {
  it('uRLSearchParams 实例应返回 true', () => {
    expect(isURLSearchParams(new URLSearchParams('a=1'))).toBe(true)
  })

  it('字符串与普通对象应返回 false', () => {
    expect(isURLSearchParams('a=1')).toBe(false)
    expect(isURLSearchParams({})).toBe(false)
  })
})

describe('isBlob - 判定 Blob 实例', () => {
  it('blob 实例应返回 true', () => {
    expect(isBlob(new Blob(['content']))).toBe(true)
  })

  it('字符串与普通对象应返回 false', () => {
    expect(isBlob('not a blob')).toBe(false)
    expect(isBlob({})).toBe(false)
  })
})
