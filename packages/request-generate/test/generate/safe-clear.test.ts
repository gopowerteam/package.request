import { describe, expect, it } from 'vitest'
import { safeClearGeneratedDir, writeGeneratedMarker } from '../../src/generate/safe-clear'

describe('safe-clear - 目录删除安全守卫', () => {
  it('输出路径在 cwd 之外时应抛出错误', () => {
    expect(() => safeClearGeneratedDir('/tmp/outside-cwd-test')).toThrow(
      /输出路径必须在项目目录内/,
    )
  })

  it('拒绝清空 cwd 本身', () => {
    expect(() => safeClearGeneratedDir(process.cwd())).toThrow(
      /输出路径必须在项目目录内/,
    )
  })

  it('已存在目录但无 .generated 标记时应拒绝清空', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      // 模拟用户已存在的同名目录(无 .generated 标记)
      fs.mkdirSync('existing-dir', { recursive: true })
      fs.writeFileSync('existing-dir/user-file.txt', 'user data')

      expect(() => safeClearGeneratedDir('existing-dir')).toThrow(
        /目标目录已存在且非生成产物/,
      )
      // 错误信息应包含 forceClear 提示
      expect(() => safeClearGeneratedDir('existing-dir')).toThrow(
        /forceClear: true/,
      )

      // 用户数据应完好无损
      expect(fs.readFileSync('existing-dir/user-file.txt', 'utf-8')).toBe('user data')
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('force=true 时,无 .generated 标记的目录应被清空', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      // 模拟旧版本生成的目录(无 .generated 标记)
      fs.mkdirSync('legacy-dir', { recursive: true })
      fs.writeFileSync('legacy-dir/old-model.ts', 'old content')

      const markerPath = safeClearGeneratedDir('legacy-dir', true)

      // 目录被清空并重建
      expect(fs.existsSync('legacy-dir/old-model.ts')).toBe(false)
      expect(fs.existsSync('legacy-dir')).toBe(true)

      // 写入标记后,后续生成无需 force 也能正常清空
      writeGeneratedMarker(markerPath)
      expect(fs.existsSync(markerPath)).toBe(true)
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('force=true 时仍拒绝 cwd 之外的路径', () => {
    expect(() => safeClearGeneratedDir('/tmp/outside-cwd-test', true)).toThrow(
      /输出路径必须在项目目录内/,
    )
  })

  it('带 .generated 标记的目录应被安全清空', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      fs.mkdirSync('gen-dir', { recursive: true })
      fs.writeFileSync('gen-dir/.generated', 'old')
      fs.writeFileSync('gen-dir/old-model.ts', 'old content')

      const markerPath = safeClearGeneratedDir('gen-dir')

      // 目录被清空并重建
      expect(fs.existsSync('gen-dir/old-model.ts')).toBe(false)
      // 旧标记应被一并删除
      expect(fs.existsSync(markerPath)).toBe(false)
      // 但目录本身存在,等待写入新标记
      expect(fs.existsSync('gen-dir')).toBe(true)

      // 写入新标记
      writeGeneratedMarker(markerPath)
      expect(fs.existsSync(markerPath)).toBe(true)
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('不存在的目录应被自动创建', async () => {
    const { default: fs } = await import('node:fs')
    const os = await import('node:os')
    const { default: path } = await import('node:path')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      const markerPath = safeClearGeneratedDir('fresh-dir/nested')

      expect(fs.existsSync('fresh-dir/nested')).toBe(true)
      writeGeneratedMarker(markerPath)
      expect(fs.existsSync('fresh-dir/nested/.generated')).toBe(true)
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
