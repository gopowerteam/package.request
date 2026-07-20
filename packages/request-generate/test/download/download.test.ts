import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Download } from '../../src/download'

describe('download.downloadOpenAPIFile - response.ok 校验', () => {
  const originalFetch = globalThis.fetch
  let tmpCwd = ''
  let originalCwd = ''

  beforeEach(async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    originalCwd = process.cwd()
    process.chdir(tmpCwd)
  })

  afterEach(async () => {
    globalThis.fetch = originalFetch
    process.chdir(originalCwd)

    const { default: fs } = await import('node:fs')
    if (tmpCwd) {
      fs.rmSync(tmpCwd, { recursive: true, force: true })
    }
  })

  it('response.ok === false 时应抛出包含状态码的错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      }),
    )

    await expect(
      Download.downloadOpenAPIFile({
        name: 'test',
        application: 'svc',
        input: 'https://example.com/missing.json',
        output: '.',
        exportModels: false,
      }),
    ).rejects.toThrow(/下载失败.*404/)
  })

  it('response.ok === true 时应正常写入文件', async () => {
    const { default: fs } = await import('node:fs')

    // downloadOpenAPIFile 假设 .request 目录已被 startup 创建
    fs.mkdirSync('.request', { recursive: true })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ openapi: '3.0.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await Download.downloadOpenAPIFile({
      name: 'svc',
      application: 'svc',
      input: 'https://example.com/ok.json',
      output: '.',
      exportModels: false,
    })

    expect(fs.existsSync('.request/svc.json')).toBe(true)
  })
})
