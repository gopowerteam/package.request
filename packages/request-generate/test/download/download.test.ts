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

describe('download.downloadOpenAPIFile - ETag 条件请求', () => {
  const originalFetch = globalThis.fetch
  let tmpCwd = ''
  let originalCwd = ''

  beforeEach(async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-etag-'))
    originalCwd = process.cwd()
    process.chdir(tmpCwd)
    fs.mkdirSync('.request', { recursive: true })
  })

  afterEach(async () => {
    globalThis.fetch = originalFetch
    process.chdir(originalCwd)

    const { default: fs } = await import('node:fs')
    if (tmpCwd) {
      fs.rmSync(tmpCwd, { recursive: true, force: true })
    }
  })

  it('200 + ETag 时应持久化 meta 供下次条件请求', async () => {
    const { default: fs } = await import('node:fs')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ openapi: '3.0.0' }), {
        status: 200,
        headers: { ETag: '"v1"' },
      }),
    )

    await Download.downloadOpenAPIFile({
      name: 'svc',
      application: 'svc',
      input: 'https://example.com/spec.json',
      output: '.',
      exportModels: false,
    })

    expect(fs.existsSync('.request/svc.meta.json')).toBe(true)
    expect(JSON.parse(fs.readFileSync('.request/svc.meta.json', 'utf-8'))).toEqual({ etag: '"v1"' })
  })

  it('服务端无 ETag/Last-Modified 时不应写入 meta', async () => {
    const { default: fs } = await import('node:fs')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ openapi: '3.0.0' }), { status: 200 }),
    )

    await Download.downloadOpenAPIFile({
      name: 'svc',
      application: 'svc',
      input: 'https://example.com/spec.json',
      output: '.',
      exportModels: false,
    })

    expect(fs.existsSync('.request/svc.meta.json')).toBe(false)
  })

  it('二次调用应发送 If-None-Match,304 时保留本地文件原样并标记 unchanged', async () => {
    const { default: fs } = await import('node:fs')

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ openapi: '3.0.0' }), {
          status: 200,
          headers: { ETag: '"v1"' },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 304 }))

    const option = {
      name: 'svc',
      application: 'svc',
      input: 'https://example.com/spec.json',
      output: '.',
      exportModels: false,
    }

    await Download.downloadOpenAPIFile(option)
    // 首次下载后人为改写本地文件为哨兵值,304 时不应被覆盖
    fs.writeFileSync('.request/svc.json', 'sentinel', 'utf-8')

    const result = await Download.downloadOpenAPIFile(option)

    expect(result.unchanged).toBe(true)
    expect(result.size).toBe(0)
    expect(fs.readFileSync('.request/svc.json', 'utf-8')).toBe('sentinel')

    const secondInit = fetchSpy.mock.calls[1][1] as RequestInit
    expect((secondInit.headers as Record<string, string>)['If-None-Match']).toBe('"v1"')
  })

  it('本地文件输入应直读复制且不发起网络请求', async () => {
    const { default: fs } = await import('node:fs')

    fs.writeFileSync('local-spec.json', JSON.stringify({ swagger: '2.0' }), 'utf-8')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const result = await Download.downloadOpenAPIFile({
      name: 'svc',
      application: 'svc',
      input: 'local-spec.json',
      output: '.',
      exportModels: false,
    })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.unchanged).toBeUndefined()
    expect(fs.readFileSync('.request/svc.json', 'utf-8')).toBe(JSON.stringify({ swagger: '2.0' }))
  })

  it('meta 残留但 spec 缺失时应剥离条件头强制全量下载', async () => {
    const { default: fs } = await import('node:fs')

    // 模拟 meta 残留但本地文档被删除的场景
    fs.writeFileSync('.request/svc.meta.json', JSON.stringify({ etag: '"v1"' }), 'utf-8')

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ openapi: '3.0.0' }), {
        status: 200,
        headers: { ETag: '"v2"' },
      }),
    )

    await Download.downloadOpenAPIFile({
      name: 'svc',
      application: 'svc',
      input: 'https://example.com/spec.json',
      output: '.',
      exportModels: false,
    })

    expect(fetchSpy.mock.calls[0][1]?.headers).toEqual({})
    expect(fs.existsSync('.request/svc.json')).toBe(true)
    expect(JSON.parse(fs.readFileSync('.request/svc.meta.json', 'utf-8'))).toEqual({ etag: '"v2"' })
  })
})
