import type { GenerateOptions } from '../../src/types/generate-options'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Download } from '../../src/download'

function createOptions(overrides: Partial<GenerateOptions> = {}): GenerateOptions {
  return {
    gateway: 'https://gw.example.com',
    openapi: '/v2/api-docs',
    output: 'generated',
    exportModels: true,
    logger: false,
    ...overrides,
  }
}

describe('download.startup - 目录创建与多应用下载', () => {
  const originalFetch = globalThis.fetch
  let tmpCwd = ''
  let originalCwd = ''

  beforeEach(() => {
    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    originalCwd = process.cwd()
    process.chdir(tmpCwd)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.chdir(originalCwd)
    vi.restoreAllMocks()

    if (tmpCwd) {
      fs.rmSync(tmpCwd, { recursive: true, force: true })
    }
  })

  it('多应用循环下载并写入 .request 目录', async () => {
    const docA = { swagger: '2.0', info: { title: 'A', version: '1' } }
    const docB = { openapi: '3.0.0', info: { title: 'B', version: '1' } }

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const body = String(input).includes('svc-a') ? docA : docB
      return new Response(JSON.stringify(body), { status: 200 })
    })

    await Download.startup(createOptions({
      applications: {
        alpha: 'svc-a',
        beta: { key: 'svc-b', openapi: 'v3/api-docs' },
      },
    }))

    // .request 目录被自动创建,内容为 pretty JSON
    expect(fs.existsSync('.request')).toBe(true)
    expect(fs.readFileSync(path.join('.request', 'alpha.json'), 'utf-8'))
      .toBe(JSON.stringify(docA, null, 2))
    expect(fs.readFileSync(path.join('.request', 'beta.json'), 'utf-8'))
      .toBe(JSON.stringify(docB, null, 2))

    // 多应用循环:每个 application 各请求一次
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const urls = fetchMock.mock.calls.map(call => String(call[0]))
    expect(urls.some(url => url.includes('/svc-a/') && url.endsWith('/v2/api-docs'))).toBe(true)
    expect(urls.some(url => url.includes('/svc-b/') && url.endsWith('/v3/api-docs'))).toBe(true)
  })

  it('未配置 applications 时应下载到 default.json', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(JSON.stringify({ swagger: '2.0' }), { status: 200 }),
    )

    await Download.startup(createOptions())

    expect(fs.existsSync(path.join('.request', 'default.json'))).toBe(true)
  })

  it('部分下载失败时应抛出第一个错误且成功项已落盘', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      if (String(input).includes('svc-b')) {
        return new Response('Not Found', { status: 404, statusText: 'Not Found' })
      }
      return new Response(JSON.stringify({ swagger: '2.0' }), { status: 200 })
    })

    await expect(Download.startup(createOptions({
      applications: { ok: 'svc-a', fail: 'svc-b' },
    }))).rejects.toThrow(/下载失败.*404/)

    expect(fs.existsSync(path.join('.request', 'ok.json'))).toBe(true)
    expect(fs.existsSync(path.join('.request', 'fail.json'))).toBe(false)
  })

  it('fetch 网络异常时应透传原始错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network boom'))

    await expect(
      Download.startup(createOptions({ applications: { alpha: 'svc-a' } })),
    ).rejects.toThrow('network boom')

    // .request 目录在任何下载发生前已创建
    expect(fs.existsSync('.request')).toBe(true)
  })

  it('logger 开关应控制输出', async () => {
    // 每次调用返回新 Response(响应体只能读取一次)
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(JSON.stringify({ swagger: '2.0' }), { status: 200 }),
    )
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    try {
      await Download.startup(createOptions({ applications: { alpha: 'svc-a' }, logger: false }))
      expect(logSpy).not.toHaveBeenCalled()

      logSpy.mockClear()
      await Download.startup(createOptions({ applications: { alpha: 'svc-a' }, logger: true }))

      const output = logSpy.mock.calls.map(args => args.join(' ')).join('\n')
      expect(output).toContain('开始下载接口文件')
      expect(output).toContain('alpha') // 汇总表格中的应用名

      // 失败项在开启日志时也应记录到汇总表格(size/status 标记为失败)
      logSpy.mockClear()
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        async () => new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      )
      await expect(
        Download.startup(createOptions({ applications: { alpha: 'svc-a' }, logger: true })),
      ).rejects.toThrow(/下载失败/)
      expect(logSpy.mock.calls.map(args => args.join(' ')).join('\n')).toContain('✗')
    }
    finally {
      logSpy.mockRestore()
    }
  })
})
