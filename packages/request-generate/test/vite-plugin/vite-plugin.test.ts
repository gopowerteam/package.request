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
  Generate: {
    startup: vi.fn(),
  },
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
    default: {
      ...baseGenerateOptions,
      ...overrides,
    } as GenerateOptions,
  }
}

interface PluginHooks {
  configResolved: (config: ResolvedConfig) => void
  buildStart: () => Promise<void>
  resolveId: (id: string) => string | undefined | null
  load: (id: string) => Promise<string | undefined | null> | string | undefined | null
}

function getHooks(plugin: unknown): PluginHooks {
  return plugin as PluginHooks
}

function createViteConfig(root: string, replacement = path.join(root, 'src')): ResolvedConfig {
  return {
    root,
    resolve: {
      alias: [
        { find: '@', replacement },
      ],
    },
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
    await expect(hooks.load('other-id')).resolves.toBeUndefined()

    const code = (await hooks.load('virtual:request')) ?? ''
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

    const code = (await hooks.load('virtual:request')) ?? ''
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

    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('import { UserService } from \'@/services/UserService\'')
    expect(code).toContain('UserService,')
  })

  // #5 修复:groups 与扁平 service 混合渲染,未分组 service 不再被静默丢弃
  it('存在分组时,无分组 service 也进入虚拟模块(混合渲染)', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'src/http' }))
    writeService(path.join(tmpRoot, 'src/http/mall'), 'OrderService')
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('Mall_OrderService')
    expect(code).toContain('UserService')
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

    await expect(hooks.load('virtual:request'))
      .rejects
      .toThrow('未在 "src/http/services" 下找到任何 Service 文件')

    // 未传 dir 时错误提示回退为空字符串(目录信息来自 options.dir,而非实际扫描目录)
    const pluginWithoutDir = requestGeneratePlugin({ alias: '@', dts: true })
    const hooksWithoutDir = getHooks(pluginWithoutDir)
    hooksWithoutDir.configResolved(createViteConfig(tmpRoot))
    await hooksWithoutDir.buildStart()

    await expect(hooksWithoutDir.load('virtual:request'))
      .rejects
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

  it('alias 未在 Vite 配置中找到时抛出明确错误,并附上当前已配置的别名列表', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '$src', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot)) // 仅有 '@' 别名

    await expect(hooks.buildStart()).rejects.toThrow('Vite alias "$src" 未在配置中找到')
    await expect(hooks.buildStart()).rejects.toThrow('当前已配置: @')
  })

  it('service 文件不在 alias 指向目录内时抛出明确错误(而非静默产出坏 import)', async () => {
    // alias '@' 指向 <root>/src,扫描目录为 <root>/generated → 改写必然未命中
    writeService(path.join(tmpRoot, 'generated/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true, dir: 'generated' })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))

    await expect(hooks.buildStart()).rejects.toThrow(
      /不在 alias "@"\(指向 ".*\/src"\)目录内/,
    )
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

  it('groupStrategy: \'first-dir\' 以扫描目录下第一级子目录作为分组', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    // 多应用布局: <output>/<app>/services/XxxService.ts
    writeService(path.join(tmpRoot, 'generated/dso-service/services'), 'AuthService')
    writeService(path.join(tmpRoot, 'generated/crm-service/services'), 'AuthService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))
    await hooks.buildStart()

    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('import { AuthService as DsoService_AuthService } from \'@/dso-service/services/AuthService\'')
    expect(code).toContain('import { AuthService as CrmService_AuthService } from \'@/crm-service/services/AuthService\'')
    expect(code).toContain('DsoService: {')
    expect(code).toContain('AuthService: DsoService_AuthService,')
    expect(code).toContain('CrmService: {')

    // d.ts 同步分组声明
    const dts = fs.readFileSync(path.join(tmpRoot, 'request.d.ts'), 'utf-8')
    expect(dts).toContain('DsoService_AuthService')
  })

  it('groupStrategy: \'first-dir\' 两个目录 PascalCase 后撞名时报错(dso-service vs Dso-service)', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated/dso-service/services'), 'UserService')
    writeService(path.join(tmpRoot, 'generated/Dso-service/services'), 'UserService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))

    await expect(hooks.buildStart()).rejects.toThrow(
      /目录 ".+" 与 ".+" 均映射为分组 "DsoService"/,
    )
  })

  it('groupStrategy: \'first-dir\' 同组内 Service 重名时报错并列出两个路径', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated/dso-service/services'), 'AuthService')
    writeService(path.join(tmpRoot, 'generated/dso-service/services/nested'), 'AuthService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))

    await expect(hooks.buildStart()).rejects.toThrow(
      /分组 "DsoService" 下 "AuthService" 同时来自/,
    )
  })

  it('分组名与扁平 Service 名顶层撞键时报错', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    // 目录 mall-service → 分组 MallService;扫描根下扁平文件 MallService.ts → 同名撞键
    writeService(path.join(tmpRoot, 'generated/mall-service/services'), 'OrderService')
    writeService(path.join(tmpRoot, 'generated'), 'MallService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))

    await expect(hooks.buildStart()).rejects.toThrow(/serviceMap 顶层键冲突: "MallService"/)
  })

  it('groupStrategy: \'none\' 强制扁平,重名时报错', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated/dso-service/services'), 'AuthService')
    writeService(path.join(tmpRoot, 'generated/crm-service/services'), 'AuthService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'none',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))

    await expect(hooks.buildStart()).rejects.toThrow(
      /"AuthService" 同时来自/,
    )
  })

  it('groupStrategy: \'none\' 无重名时输出扁平结构', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated/dso-service/services'), 'AuthService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'none',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))
    await hooks.buildStart()

    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('import { AuthService } from \'@/dso-service/services/AuthService\'')
    expect(code).toContain('AuthService,')
    expect(code).not.toContain('DsoService: {')
  })

  it('分组名为非法标识符(数字开头)时报错', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated/2xx-app/services'), 'UserService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))

    await expect(hooks.buildStart()).rejects.toThrow(/不是合法的标识符/)
  })

  it('first-dir:文件直接位于扫描根时视为未分组(扁平)', async () => {
    vi.mocked(loadConfigFile).mockResolvedValue(generateOptions({ output: 'generated' }))
    writeService(path.join(tmpRoot, 'generated'), 'RootService')

    const plugin = requestGeneratePlugin({
      alias: '@',
      dts: true,
      dir: 'generated',
      groupStrategy: 'first-dir',
    })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot, path.join(tmpRoot, 'generated')))
    await hooks.buildStart()

    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('import { RootService } from')
    expect(code).toContain('RootService,')
  })

  it('vitest 场景:不执行 buildStart 直接 load 时现场生成+扫描(惰性兜底)', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))

    // 不调用 buildStart,直接 load → 惰性执行生成与扫描
    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('UserService')
    expect(Generate.startup).toHaveBeenCalled()

    // 幂等:再次 load 不重复执行生成
    const startupCalls = vi.mocked(Generate.startup).mock.calls.length
    await hooks.load('virtual:request')
    expect(vi.mocked(Generate.startup).mock.calls.length).toBe(startupCalls)
  })

  it('generate: false 时跳过进程内生成,仅扫描+装配', async () => {
    writeService(path.join(tmpRoot, 'src/http/services'), 'UserService')

    const plugin = requestGeneratePlugin({ alias: '@', dts: true, generate: false })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))
    await hooks.buildStart()

    expect(Generate.startup).not.toHaveBeenCalled()
    const code = (await hooks.load('virtual:request')) ?? ''
    expect(code).toContain('UserService')
  })

  it('throwOnError: false 时生成失败降级为可加载的空实现', async () => {
    vi.mocked(Generate.startup).mockRejectedValueOnce(new Error('boom'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const plugin = requestGeneratePlugin({ alias: '@', dts: true, throwOnError: false })
      const hooks = getHooks(plugin)
      hooks.configResolved(createViteConfig(tmpRoot))

      // buildStart 不抛出
      await expect(hooks.buildStart()).resolves.toBeUndefined()

      // 虚拟模块可加载,useRequest 调用时抛出带原因的运行时错误
      const code = (await hooks.load('virtual:request')) ?? ''
      expect(code).toContain('export function useRequest()')
      expect(code).toContain('boom')

      // d.ts 不落盘(编译期显式缺模块声明优于静默空类型)
      expect(fs.existsSync(path.join(tmpRoot, 'request.d.ts'))).toBe(false)
      expect(warnSpy).toHaveBeenCalled()
    }
    finally {
      warnSpy.mockRestore()
    }
  })

  it('throwOnError 缺省时生成失败仍抛出(向后兼容)', async () => {
    vi.mocked(Generate.startup).mockRejectedValueOnce(new Error('boom'))

    const plugin = requestGeneratePlugin({ alias: '@', dts: true })
    const hooks = getHooks(plugin)
    hooks.configResolved(createViteConfig(tmpRoot))

    await expect(hooks.buildStart()).rejects.toThrow('request-generate 接口生成失败')
  })
})
