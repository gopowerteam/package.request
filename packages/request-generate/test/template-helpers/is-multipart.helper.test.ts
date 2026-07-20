import { describe, expect, it } from 'vitest'
import { isMultipartHelper } from '../../src/template-helpers/is-multipart.helper'

describe('is-multipart helper - 判定 media-type 是否为 multipart 家族', () => {
  const fn = isMultipartHelper.fn

  it('multipart/form-data 返回 true', () => {
    expect(fn('multipart/form-data')).toBe(true)
  })

  it('multipart/mixed 返回 false(仅 form-data 命中)', () => {
    expect(fn('multipart/mixed')).toBe(false)
  })

  it('application/json 返回 false', () => {
    expect(fn('application/json')).toBe(false)
  })

  it('application/octet-stream 返回 false', () => {
    expect(fn('application/octet-stream')).toBe(false)
  })

  it('text/plain 返回 false', () => {
    expect(fn('text/plain')).toBe(false)
  })

  it('undefined 返回 false', () => {
    expect(fn(undefined)).toBe(false)
  })

  it('空字符串返回 false', () => {
    expect(fn('')).toBe(false)
  })
})
