import type { ResolvedConfig } from 'vite'
import type { GenerateOptions } from '../../src/types/generate-options'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Generate } from '../../src/generate'
import { loadConfigFile } from '../../src/load-config'
import requestGeneratePlugin from '../../src/vite-plugin'

vi.mock('../../src/generate', () => ({
  Generate: { startup: vi.fn() },
}))

vi.mock('../../src/load-config', () => ({
  loadConfigFile: vi.fn(),
}))

const baseGenerateOptions = {
  gateway: 'https://gateway.example.com',
  openapi: 'https://gateway.example.com/docs',
  exportModels: false,
  output: 'src/http/services',
}

function generateOptions(overrides: Partial<GenerateOptions> = {}) {
  return {
    default: { ...baseGenerateOptions, ...overrides } as GenerateOptions,
  }
}

interface PluginHooks {
  configResolved: (config: ResolvedConfig) => void
  buildStart: () => Promise<void>
  resolveId: (id: string) => string | undefined | null
  load: (id: string) => string | undefined | null
}

function getHooks(plugin: unknown): PluginHooks {
  return plugin as PluginHooks
}

function createViteConfig(root: string, replacement = path.join(root, 'src')): ResolvedConfig {
  return {
    root,
    resolve: { alias: [{ find: '@', replacement }] },
  } as unknown as ResolvedConfig
}

function writeService(dir: string, name: string) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${name}.ts`), `export class ${name} {}\n`)
}

describe('vite-plugin requestGeneratePlugin', () => {
  let tmpRoot = ''

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-vite-plugin-'))
    vi.mocked(Generate.startup).mockResolvedValue(undefined)
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions())
  })

  afterEach(() => {
    vi.resetAllMocks()
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('插件元信息:name 与 enforce', () => {
    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    expect(plugin).toHaveProperty('name', 'request-generate')
    expect(plugin).toHaveProperty('enforce', 'pre')
  })

  it('configResolved 之前调用 buildStart 抛出明确错误', async () => {
    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    await expect(getHooks(plugin).buildStart()).rejects.toThrow('Vite 配置尚未解析完成')
  })

  it('无分组:虚拟模块平铺导入 service,并输出默认 request.d.ts', async () => {
    const servicesDir = path.join(tmpRoot, 'src/http/services')
    writeService(servicesDir, 'UserService')
    // 非 Service 文件不应被收集
    fs.writeFileSync(path.join(servicesDir, 'index.ts'), 'export const x = 1\n')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(loadConfigFile).toHaveBeenCalledWith(undefined, tmpRoot)
    expect(hooks.resolveId('virtual:request')).toBe('virtual:request')
    expect(hooks.resolveId('other-id')).toBeUndefined()
    expect(hooks.load('other-id')).toBeUndefined()

    const code = hooks.load('virtual:request') ?? ''
    expect(code).toContain('import { UserService } from \'@/http/services/UserService\'')
    expect(code).toContain('const serviceMap = {')
    expect(code).toContain('UserService,')
    expect(code).toContain('export function useRequest(')
    expect(code).not.toContain('\'@/http/services/index\'')

    const dtsPath = path.join(tmpRoot, 'request.d.ts')
    expect(fs.existsSync(dtsPath)).toBe(true)
    const dts = fs.readFileSync(dtsPath, 'utf-8')
    expect(dts).toContain('declare module \'virtual:request\'')
    expect(dts).toContain('UserService')
  })

  it('分组:http 下的一级目录作为分组,递归扫描子目录', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'src/http' }))
    writeService(path.join(tmpRoot, 'src/http/mall'), 'OrderService')
    writeService(path.join(tmpRoot, 'src/http/mall/order'), 'TradeService')
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    const code = hooks.load('virtual:request') ?? ''
    expect(code).toContain('import { OrderService as Mall_OrderService } from \'@/http/mall/OrderService\'')
    expect(code).toContain('import { TradeService as Mall_TradeService } from \'@/http/mall/order/TradeService\'')
    expect(code).toContain('Mall: {')
    expect(code).toContain('OrderService: Mall_OrderService,')
    expect(code).toContain('TradeService: Mall_TradeService,')
  })

  it('扫描目录不含 http 段时所有 service 视为无分组', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'src/services' }))
    writeService(path.join(tmpRoot, 'src/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    const code = hooks.load('virtual:request') ?? ''
    expect(code).toContain('import { UserService } from \'@/services/UserService\'')
    expect(code).toContain('UserService,')
  })

  // 固化现状:groups 分支的模板只遍历 groups,未分组 service 被丢弃(疑似 bug,详见测试报告)
  it('存在分组时,无分组 service 不会进入虚拟模块(疑似 bug 现状固化)', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'src/http' }))
    writeService(path.join(tmpRoot, 'src/http/mall'), 'OrderService')
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    const code = hooks.load('virtual:request') ?? ''
    expect(code).toContain('Mall_OrderService')
    expect(code).not.toContain('UserService')
  })

  it('dts: false 时不生成声明文件', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: false })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(fs.existsSync(path.join(tmpRoot, 'request.d.ts'))).toBe(false)
  })

  it('dts 为相对路径时写到指定位置,并自动创建目录', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: 'types/api/request.d.ts' })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(fs.existsSync(path.join(tmpRoot, 'types/api/request.d.ts'))).toBe(true)
  })

  it('未扫描到任何 Service 时 load 抛出引导错误', async () => {
    fs.mkdirSync(path.join(tmpRoot, 'src/http/services'), { recursive: true })

    const plugin = requestGeneratePlugin({ alias: '@', dts: true, dir: 'src/http/services' })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(() => hooks.load('virtual:request'))
      .toThrow('未在 "src/http/services" 下找到任何 Service 文件')

    // 未传 dir 时错误提示回退为空字符串(目录信息来自 options.dir,而非实际扫描目录)
    const pluginWithoutDir = requestGeneratePlugin({ alias: '@', dts: true })
    const hooksWithoutDir = getHooks(pluginWithoutDir)
    hooksWithoutDir.configResolved(createViteConfig(tmpRoot))
    await hooksWithoutDir.buildStart()

    expect(() => hooksWithoutDir.load('virtual:request'))
      .toThrow('未在 "" 下找到任何 Service 文件')
  })

  it('插件选项与配置均未提供目录时抛出明确错误', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(
      generateOptions({ output: undefined }),
    )

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))

    await expect(hooks.buildStart()).rejects.toThrow('未指定扫描目录')
  })

  it('alias 未在 Vite 配置中找到时抛出明确错误', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '$src', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot)) // 仅有 '@' 别名

    await expect(hooks.buildStart()).rejects.toThrow('Vite alias "$src" 未在配置中找到')
  })

  it('generate.startup 失败时包装为统一错误', async () => {
    vi.mocked(Generate.startup).mockRejectedValueOnce(new Error('boom'))

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))

    await expect(hooks.buildStart()).rejects.toThrow('request-generate 接口生成失败')
  })

  it('configFile 选项透传给 loadConfigFile', async () => {
    const plugin = requestGeneratePlugin({ alias: '@', dts: true, configFile: 'custom.config.ts' })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(loadConfigFile).toHaveBeenCalledWith('custom.config.ts', tmpRoot)
  })
})
