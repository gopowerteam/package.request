import { describe, expect, it } from 'vitest'
import { isNeedUpdate, readLocalConfig } from '../../src/generate/write-config'

describe('write-config - MD5 与配置读取', () => {
  it('readLocalConfig 在配置文件不存在时应返回空数组', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      expect(readLocalConfig()).toEqual([])
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('isNeedUpdate 应返回稳定 MD5(基于 Buffer 而非字符串)', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/test.json', '{"hello":"world"}')

      const md5First = isNeedUpdate('test', [], tmpDir)
      const md5Second = isNeedUpdate('test', [], tmpDir)

      expect(typeof md5First).toBe('string')
      expect(md5First).toHaveLength(32) // MD5 hex 长度
      expect(md5First).toBe(md5Second) // 同内容应稳定

      expect(md5First).toBeTruthy()
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('isNeedUpdate 在源文件不存在时应抛出明确错误', async () => {
    const os = await import('node:os')
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      expect(() => isNeedUpdate('nonexistent', [], tmpDir)).toThrow(
        /未找到相应的配置文件/,
      )
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
