import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadConfigFile } from '../src/load-config'

vi.mock('tsx/esm/api', () => ({ tsImport: vi.fn() }))

const baseConfig = {
  gateway: 'https://gateway.example.com',
  openapi: 'https://gateway.example.com/docs',
  output: 'generated',
  exportModels: true,
}

function mockTsImport(value: unknown) {
  vi.mocked(tsImport).mockResolvedValue(value as Awaited<ReturnType<typeof tsImport>>)
}

describe('load-config loadConfigFile', () => {
  let tmpCwd = ''
  let originalCwd = ''

  beforeEach(() => {
    tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-load-config-'))
    originalCwd = process.cwd()
    process.chdir(tmpCwd)
    vi.mocked(tsImport).mockReset()
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpCwd, { recursive: true, force: true })
  })

  it('找不到任何配置文件时抛出明确错误', async () => {
    await expect(loadConfigFile()).rejects.toThrow(/未找到 request-generate 配置文件/)
  })

  it('默认优先加载 request.config.ts,并经 tsx tsImport 加载', async () => {
    fs.writeFileSync(
      path.join(tmpCwd, 'request.config.ts'),
      'export default {} // 内容无关,tsImport 已被 mock\n',
    )
    const config = { ...baseConfig, gateway: 'https://ts-gateway' }
    mockTsImport({ default: config })

    const { default: loaded } = await loadConfigFile()

    expect(loaded).toBe(config)
    expect(tsImport).toHaveBeenCalledTimes(1)
    expect(tsImport).toHaveBeenCalledWith(
      pathToFileURL(path.join(tmpCwd, 'request.config.ts')).href,
      { parentURL: expect.any(String) },
    )
  })

  it('tsx 编译产物为双层 default(__esModule)时正确解包', async () => {
    fs.writeFileSync(path.join(tmpCwd, 'request.config.ts'), 'export default {}\n')
    const config = { ...baseConfig, gateway: 'https://inner' }
    mockTsImport({ default: { __esModule: true, default: config } })

    const { default: loaded } = await loadConfigFile()

    expect(loaded).toBe(config)
  })

  it('无 .ts 时回退到 request-generate.config.cjs(原生 import)', async () => {
    fs.writeFileSync(
      path.join(tmpCwd, 'request-generate.config.cjs'),
      'module.exports = { gateway: "https://cjs", openapi: "x", output: "out", exportModels: false }\n',
    )

    const { default: loaded } = await loadConfigFile()

    expect(loaded.gateway).toBe('https://cjs')
    expect(tsImport).not.toHaveBeenCalled()
  })

  it('request-generate.config.mjs 通过原生 import 加载', async () => {
    fs.writeFileSync(
      path.join(tmpCwd, 'request-generate.config.mjs'),
      'export default { gateway: "https://mjs", openapi: "x", output: "out", exportModels: false }\n',
    )

    const { default: loaded } = await loadConfigFile()

    expect(loaded.gateway).toBe('https://mjs')
    expect(tsImport).not.toHaveBeenCalled()
  })

  it('request-generate.config.js 通过原生 import 加载', async () => {
    fs.writeFileSync(
      path.join(tmpCwd, 'request-generate.config.js'),
      'module.exports = { gateway: "https://js", openapi: "x", output: "out", exportModels: false }\n',
    )

    const { default: loaded } = await loadConfigFile()

    expect(loaded.gateway).toBe('https://js')
    expect(tsImport).not.toHaveBeenCalled()
  })

  it('候选优先级:.ts 高于 .cjs/.mjs/.js', async () => {
    fs.writeFileSync(path.join(tmpCwd, 'request.config.ts'), 'export default {}\n')
    fs.writeFileSync(path.join(tmpCwd, 'request-generate.config.cjs'), 'module.exports = { gateway: "https://cjs" }')
    fs.writeFileSync(path.join(tmpCwd, 'request-generate.config.mjs'), 'export default { gateway: "https://mjs" }')
    fs.writeFileSync(path.join(tmpCwd, 'request-generate.config.js'), 'module.exports = { gateway: "https://js" }')

    const config = { ...baseConfig, gateway: 'https://ts-wins' }
    mockTsImport({ default: config })

    const { default: loaded } = await loadConfigFile()

    expect(loaded).toBe(config)
    expect(tsImport).toHaveBeenCalledWith(
      pathToFileURL(path.join(tmpCwd, 'request.config.ts')).href,
      expect.anything(),
    )
  })

  it('配置模块无 default 导出时回退使用模块本身', async () => {
    fs.writeFileSync(
      path.join(tmpCwd, 'request-generate.config.mjs'),
      'export const config = { gateway: "https://named", openapi: "x", output: "out", exportModels: false }\n',
    )

    const { default: loaded } = await loadConfigFile()
    const loadedRecord = loaded as unknown as Record<string, { gateway: string }>

    expect(loadedRecord.config.gateway).toBe('https://named')
  })

  it('显式指定配置文件路径(绝对路径)时优先加载该文件', async () => {
    const absPath = path.join(tmpCwd, 'custom.mjs')
    fs.writeFileSync(
      absPath,
      'export default { gateway: "https://custom", openapi: "x", output: "out", exportModels: false }\n',
    )

    const { default: loaded } = await loadConfigFile(absPath)

    expect(loaded.gateway).toBe('https://custom')
    expect(tsImport).not.toHaveBeenCalled()
  })

  it('显式指定的 .ts 配置经 tsx 加载', async () => {
    fs.writeFileSync(path.join(tmpCwd, 'custom.config.ts'), 'export default {}\n')
    const config = { ...baseConfig, gateway: 'https://custom-ts' }
    mockTsImport({ default: config })

    const { default: loaded } = await loadConfigFile('custom.config.ts')

    expect(loaded).toBe(config)
    expect(tsImport).toHaveBeenCalledWith(
      pathToFileURL(path.join(tmpCwd, 'custom.config.ts')).href,
      expect.anything(),
    )
  })

  it('显式路径不存在时回退到默认候选', async () => {
    fs.writeFileSync(path.join(tmpCwd, 'request.config.ts'), 'export default {}\n')
    const config = { ...baseConfig }
    mockTsImport({ default: config })

    await loadConfigFile('missing.config.ts')

    expect(tsImport).toHaveBeenCalledWith(
      pathToFileURL(path.join(tmpCwd, 'request.config.ts')).href,
      expect.anything(),
    )
  })

  it('不支持的扩展名抛出明确错误', async () => {
    fs.writeFileSync(path.join(tmpCwd, 'config.json'), '{}\n')

    await expect(loadConfigFile('config.json')).rejects.toThrow('不支持的配置文件类型 ".json"')
  })
})
