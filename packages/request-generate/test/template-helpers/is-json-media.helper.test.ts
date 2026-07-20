import { describe, expect, it } from 'vitest'
import { isJsonMediaHelper } from '../../src/template-helpers/is-json-media.helper'

describe('is-json-media helper - 判定 media-type 是否属于 JSON 家族', () => {
  const fn = isJsonMediaHelper.fn

  it('application/json 返回 true', () => {
    expect(fn('application/json')).toBe(true)
  })

  it('application/json; charset=utf-8 返回 true', () => {
    expect(fn('application/json; charset=utf-8')).toBe(true)
  })

  it('application/problem+json 返回 true', () => {
    expect(fn('application/problem+json')).toBe(true)
  })

  it('application/vnd.custom+json 返回 true', () => {
    expect(fn('application/vnd.custom+json')).toBe(true)
  })

  it('*/* 返回 true(按 JSON 处理)', () => {
    expect(fn('*/*')).toBe(true)
  })

  it('multipart/form-data 返回 false', () => {
    expect(fn('multipart/form-data')).toBe(false)
  })

  it('application/octet-stream 返回 false', () => {
    expect(fn('application/octet-stream')).toBe(false)
  })

  it('application/pdf 返回 false', () => {
    expect(fn('application/pdf')).toBe(false)
  })

  it('text/plain 返回 false', () => {
    expect(fn('text/plain')).toBe(false)
  })

  it('application/x-www-form-urlencoded 返回 false', () => {
    expect(fn('application/x-www-form-urlencoded')).toBe(false)
  })

  it('undefined 返回 false(无 mediaType 字段时)', () => {
    expect(fn(undefined)).toBe(false)
  })

  it('空字符串返回 false', () => {
    expect(fn('')).toBe(false)
  })
})
