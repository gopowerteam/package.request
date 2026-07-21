import { describe, expect, it } from 'vitest'
import {
  classifyMediaType,
  MEDIA_TYPE_TS_MAPPING,
} from '../../src/utils/get-media-type'

describe('classifyMediaType - media 类型分类', () => {
  describe('jSON 家族', () => {
    it('应识别 application/json', () => {
      expect(classifyMediaType('application/json')).toBe('json')
    })

    it('应识别带 charset 的 application/json', () => {
      expect(classifyMediaType('application/json; charset=utf-8')).toBe('json')
      expect(classifyMediaType('application/json; charset=gbk')).toBe('json')
    })

    it('应识别 vendor +json 后缀', () => {
      expect(classifyMediaType('application/vnd.api+json')).toBe('json')
      expect(classifyMediaType('application/problem+json')).toBe('json')
      expect(classifyMediaType('application/vnd.github.v3+json')).toBe('json')
    })
  })

  describe('multipart / urlencoded', () => {
    it('应识别 multipart/form-data', () => {
      expect(classifyMediaType('multipart/form-data')).toBe('multipart')
    })

    it('应识别 application/x-www-form-urlencoded', () => {
      expect(classifyMediaType('application/x-www-form-urlencoded')).toBe('urlencoded')
    })
  })

  describe('二进制', () => {
    it('应识别 application/octet-stream', () => {
      expect(classifyMediaType('application/octet-stream')).toBe('binary')
    })

    it('应识别常见图片/音视频类型', () => {
      expect(classifyMediaType('image/png')).toBe('binary')
      expect(classifyMediaType('image/jpeg')).toBe('binary')
      expect(classifyMediaType('video/mp4')).toBe('binary')
      expect(classifyMediaType('audio/mpeg')).toBe('binary')
    })

    it('应识别文档类型(大小写不敏感)', () => {
      expect(classifyMediaType('APPLICATION/PDF')).toBe('binary')
      expect(classifyMediaType('Application/Zip')).toBe('binary')
    })
  })

  describe('text 家族', () => {
    it('应识别 text/plain 与 text/*', () => {
      expect(classifyMediaType('text/plain')).toBe('text')
      expect(classifyMediaType('text/csv')).toBe('text')
      expect(classifyMediaType('text/html')).toBe('text')
      expect(classifyMediaType('text/event-stream')).toBe('text')
    })
  })

  describe('通配与未知', () => {
    it('*/* 应归为 json 类别(便于 schema 解析)', () => {
      expect(classifyMediaType('*/*')).toBe('json')
    })

    it('空字符串归为 unknown', () => {
      expect(classifyMediaType('')).toBe('unknown')
    })

    it('未登记的 application/* 类型归为 unknown', () => {
      expect(classifyMediaType('application/x-custom')).toBe('unknown')
      expect(classifyMediaType('application/foo')).toBe('unknown')
    })
  })
})

describe('mEDIA_TYPE_TS_MAPPING - 类别 → TS 类型', () => {
  it.each([
    ['json', 'any'],
    ['binary', 'Blob'],
    ['multipart', 'FormData'],
    ['urlencoded', 'URLSearchParams'],
    ['text', 'string'],
    ['unknown', 'any'],
  ] as const)('类别 %s 应映射为 %s', (kind, expected) => {
    expect(MEDIA_TYPE_TS_MAPPING[kind].type).toBe(expected)
    expect(MEDIA_TYPE_TS_MAPPING[kind].imports).toEqual([])
  })
})
