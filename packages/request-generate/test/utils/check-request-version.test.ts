import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRequestVersion } from '../../src/utils/check-request-version'

describe('checkRequestVersion - 宿主 request 版本校验', () => {
  let tmpCwd = ''
  let originalCwd = ''

  beforeEach(async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-version-'))
    originalCwd = process.cwd()
    process.chdir(tmpCwd)
  })

  afterEach(async () => {
    process.chdir(originalCwd)

    const { default: fs } = await import('node:fs')
    if (tmpCwd) {
      fs.rmSync(tmpCwd, { recursive: true, force: true })
    }
    vi.restoreAllMocks()
  })

  function writeRequestVersion(version: string) {
    fs.mkdirSync('node_modules/@gopowerteam/request', { recursive: true })
    fs.writeFileSync(
      'node_modules/@gopowerteam/request/package.json',
      JSON.stringify({ name: '@gopowerteam/request', version }),
      'utf-8',
    )
  }

  it('版本低于下限时应输出告警', () => {
    writeRequestVersion('0.3.3')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    checkRequestVersion()

    expect(warnSpy).toHaveBeenCalledOnce()
    expect(warnSpy.mock.calls[0][0]).toContain('0.3.3')
    expect(warnSpy.mock.calls[0][0]).toContain('0.4.0')
  })

  it('版本等于下限时不应告警', () => {
    writeRequestVersion('0.4.0')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    checkRequestVersion()

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('版本高于下限时不应告警', () => {
    writeRequestVersion('1.2.3')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    checkRequestVersion()

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('版本文件缺失时应静默跳过', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => checkRequestVersion()).not.toThrow()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
