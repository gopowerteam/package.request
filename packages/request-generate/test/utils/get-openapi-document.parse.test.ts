import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getOpenApiDocument } from '../../src/utils/get-openapi-document'
import v2Minimal from '../fixtures/v2-minimal.json'

/**
 * 说明:输入校验分支已由既有的 get-openapi-document.test.ts 覆盖,
 * 本文件补充解析成功与解析失败路径(getOpenApiDocument 的剩余分支)。
 */
describe('getOpenApiDocument - 解析成功与失败路径', () => {
  it('本地 JSON 文件路径应成功解析为文档', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))

    try {
      const file = path.join(tmpDir, 'doc.json')
      fs.writeFileSync(file, JSON.stringify(v2Minimal))

      const document = (await getOpenApiDocument(file)) as {
        info?: { title?: string }
        swagger?: string
      }

      expect(document.info?.title).toBe('Minimal V2 API')
      expect(document.swagger).toBe('2.0')
    }
    finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('不存在的本地文件应拒绝并携带路径信息', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))

    try {
      const missing = path.join(tmpDir, 'missing-doc.json')
      await expect(getOpenApiDocument(missing)).rejects.toThrow(/missing-doc\.json/)
    }
    finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
