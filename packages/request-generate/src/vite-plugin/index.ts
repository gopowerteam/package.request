import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import Handlebars from 'handlebars'
import { Generate } from '../generate'
import { loadConfigFile } from '../load-config'
import { generateCodeTemplate, generateDeclareTemplate, generateDegradedTemplate } from './templates'

// 虚拟模块ID
const MODULE_ID = 'virtual:request'
// 默认定义文件名
const DECLARATION_FILE = 'request.d.ts'
// 生成产物的目录约定(相对 alias)
const HTTP_DIR_SEGMENT = 'http'
const DEFAULT_SERVICE_DIR = 'services'

export interface PluginOptions {
  alias: string
  /** 扫描 *Service.ts 的目录;未指定时回退到 request.config.ts 的 output */
  dir?: string
  dts: string | boolean
  /** 显式指定 request-generate 配置文件路径;未指定时自动发现 */
  configFile?: string
  /**
   * Service 分组策略:
   * - 'http':按 http 目录段分组(缺省,向后兼容)
   * - 'first-dir':按扫描目录下第一级子目录分组(多应用布局 <output>/<app>/services/)
   * - 'none':强制扁平
   */
  groupStrategy?: GroupStrategy
  /**
   * 是否在插件内执行进程内生成(Generate.startup):
   * - `true`(缺省):生成 + 扫描装配
   * - `false`:跳过生成(交给外部管线,如 CI 中预先运行 request-download/request-generate),仅扫描 + 装配
   */
  generate?: boolean
  /**
   * 生成/扫描失败时是否抛出错误:
   * - `true`(缺省):抛出,dev server 启动失败
   * - `false`:降级为 console.warn + 可加载的空实现(useRequest 调用时抛出明确运行时错误),前端联调不被后端可用性阻塞
   */
  throwOnError?: boolean
}

export type GroupStrategy = 'http' | 'first-dir' | 'none'

/** 扫描中间结构:原始绝对路径用于分组与报错,alias 改写路径用于导入 */
interface ScannedService {
  absolutePath: string
  importPath: string
}

interface ServiceItem {
  name: string
  group?: string
  path: string
}

interface GroupItem {
  name: string
  services: ServiceItem[]
}

/**
 * Request 插件
 *
 * 进程内调用 Generate.startup 生成接口文件,无需子进程;随后扫描产物并装配虚拟模块。
 */
export default function requestGeneratePlugin(options: PluginOptions): PluginOption {
  // 将状态收敛到插件闭包内,避免多实例/多测试共享全局
  let viteConfig: ResolvedConfig | undefined
  let generatedCode = ''
  let generationPromise: Promise<void> | undefined
  // 当前快照目录(watch 回调据此判断变更文件是否相关)
  let snapshotDirPath = ''

  /** 构建钩子上下文中用到的最小能力面(便于测试注入) */
  interface PluginHookContext {
    addWatchFile: (path: string) => void
  }

  /**
   * 生成 + 扫描装配(幂等:结果记忆化,失败同样记忆化避免重复执行副作用)
   */
  const doGenerate = async (hookContext?: PluginHookContext): Promise<void> => {
    if (!viteConfig) {
      throw new Error('Vite 配置尚未解析完成,无法执行 request-generate 插件')
    }

    try {
      // 1. 加载 request-generate 配置(进程内,支持 .ts)
      const { default: generateOptions } = await loadConfigFile(
        options.configFile,
        viteConfig.root,
      )

      // 2. 进程内生成接口文件(替代子进程调用);generate: false 时跳过(交给外部管线)
      if (options.generate !== false) {
        try {
          await Generate.startup(generateOptions)
        }
        catch (error) {
          throw new Error('request-generate 接口生成失败', { cause: error })
        }
      }

      // 3. 扫描产物并生成虚拟模块代码 / 类型声明
      const scanDir = options.dir ?? generateOptions.output
      if (!scanDir) {
        throw new Error(
          '未指定扫描目录,请在插件选项 dir 或 request.config.ts 的 output 中配置',
        )
      }

      // 扫描基准与生成器口径对齐:显式 dir 按 vite root;回退 output 按 baseDir(生成产物落地基准)
      const scanBase = options.dir
        ? viteConfig.root
        : (generateOptions.baseDir ?? viteConfig.root)
      const targetDir = path.resolve(scanBase, scanDir)

      const scanned = scanServiceFiles(targetDir, viteConfig, options.alias)
      const strategy = options.groupStrategy ?? 'http'
      const services = buildServiceItems(scanned, strategy, targetDir)
      const groups = getServiceGroups(services)
      const flatServices = services.filter(service => !service.group)

      // 重名/撞名防护:组内重名、顶层键冲突(组名 ∪ 扁平名共享 serviceMap 顶层命名空间)、
      // import 局部绑定冲突(扁平名 = 「组名_服务名」别名)
      groups.forEach(group => assertUniqueServiceNames(group.services, group.name))
      assertUniqueServiceNames(flatServices)
      assertUniqueTopLevelKeys(groups, flatServices)
      assertUniqueImportBindings(groups, flatServices)

      if (services.length > 0) {
        generatedCode = renderCode(groups, flatServices)

        if (options.dts !== false) {
          generateDeclare(groups, flatServices, options, viteConfig)
        }
      }

      // watch 模式(vite dev / rollup --watch):监听 .request 快照变更,实现「刷新接口 → 自动重载」
      if (hookContext) {
        snapshotDirPath = path.resolve(generateOptions.baseDir ?? viteConfig.root, '.request')
        if (fs.existsSync(snapshotDirPath)) {
          for (const file of fs.readdirSync(snapshotDirPath)) {
            hookContext.addWatchFile(path.join(snapshotDirPath, file))
          }
        }
      }
    }
    catch (error) {
      // throwOnError: false → 降级为警告 + 可加载的空实现(dev server 不被后端可用性阻塞)
      if (options.throwOnError !== false) {
        throw error
      }

      console.warn('[request-generate] 接口生成/扫描失败,已降级为空实现:', error)
      generatedCode = generateDegradedTemplate(error)
    }
  }

  const ensureGenerated = (hookContext?: PluginHookContext): Promise<void> => {
    generationPromise ??= doGenerate(hookContext)
    return generationPromise
  }

  return {
    name: 'request-generate',
    enforce: 'pre',
    configResolved(config) {
      viteConfig = config
    },
    buildStart() {
      return ensureGenerated(this)
    },
    configureServer(server: ViteDevServer) {
      server.watcher.on('change', async (file) => {
        if (!snapshotDirPath || !file.startsWith(snapshotDirPath)) {
          return
        }

        // 快照变更 → 重置装配结果,虚拟模块下次访问时现场重算
        generationPromise = undefined
        generatedCode = ''
        const mod = await server.moduleGraph.getModuleByUrl(MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
    resolveId(id: string) {
      return id === MODULE_ID
        ? MODULE_ID
        : undefined
    },
    async load(id: string) {
      if (id !== MODULE_ID) {
        return undefined
      }

      // 惰性兜底:非 rollup 构建管道(如 vitest 走 vite transform)不执行 buildStart,
      // 首次 load 时现场生成+扫描,不再依赖 buildStart 的执行时序
      await ensureGenerated()

      if (!generatedCode) {
        throw new Error(
          `未在 "${options.dir ?? ''}" 下找到任何 Service 文件,请先运行 request-generate 生成接口`,
        )
      }

      return generatedCode
    },
  }
}

/**
 * 将 kebab-case 字符串转为 PascalCase
 */
function toPascalCase(str = ''): string {
  return str
    .replace(/-(\w)/g, (_, $1: string) => $1.toUpperCase())
    .replace(/^\S/, s => s.toUpperCase())
}

/**
 * 扫描 targetDir 下所有 *Service.ts,并改写为 alias 导入路径
 * @param targetDir 已解析的扫描目录绝对路径
 * @param config Vite 已解析配置
 * @param alias 目标别名
 * @returns ScannedService[]
 */
function scanServiceFiles(
  targetDir: string,
  config: ResolvedConfig,
  alias: string,
): ScannedService[] {
  const files: string[] = []

  // 遍历目录
  const walk = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
      // 修正windows路径符号问题
      const fullpath = path.join(dir, file).replace(/\\/g, '/')
      const stat = fs.statSync(fullpath)

      if (stat.isFile() && fullpath.endsWith('Service.ts')) {
        files.push(fullpath)
      }
      else if (stat.isDirectory()) {
        walk(path.join(dir, file))
      }
    })
  }

  // 查找别名配置,缺失时给出明确错误
  const aliasMatch = config.resolve.alias.find(
    candidate => candidate.find === alias,
  )

  if (!aliasMatch) {
    throw new Error(
      `Vite alias "${alias}" 未在配置中找到,请在 vite.config 中配置 resolve.alias;当前已配置: ${config.resolve.alias.map(candidate => String(candidate.find)).join(', ')}`,
    )
  }

  if (fs.existsSync(targetDir)) {
    walk(targetDir)
  }

  const replacement = aliasMatch.replacement.replace(/\\/g, '/')
  return files.map((filepath) => {
    // 显式判定替代显式 replace:字符串 replace 未命中时会静默产出绝对路径 import
    if (!filepath.startsWith(replacement)) {
      throw new Error(
        `Service 文件 "${filepath}" 不在 alias "${alias}"(指向 "${replacement}")目录内,请检查 resolve.alias 与扫描目录(dir/output)是否匹配`,
      )
    }
    return { absolutePath: filepath, importPath: alias + filepath.slice(replacement.length) }
  })
}

/**
 * 由扫描结果构建 ServiceItem(名称/分组/导入路径)
 * @param scanned 扫描结果
 * @param strategy 分组策略
 * @param scanRoot 扫描根目录(first-dir 策略的相对基准)
 */
function buildServiceItems(
  scanned: ScannedService[],
  strategy: GroupStrategy,
  scanRoot: string,
): ServiceItem[] {
  const rawDirByGroup = new Map<string, string>()

  return scanned.map(({ absolutePath, importPath }) => ({
    name: toPascalCase(path.basename(importPath, '.ts')),
    group: resolveGroup(absolutePath, importPath, strategy, scanRoot, rawDirByGroup),
    path: importPath.replace(/\.ts$/g, ''),
  }))
}

/**
 * 按策略解析单个 Service 的分组
 */
function resolveGroup(
  absolutePath: string,
  importPath: string,
  strategy: GroupStrategy,
  scanRoot: string,
  rawDirByGroup: Map<string, string>,
): string | undefined {
  switch (strategy) {
    case 'none':
      return undefined
    case 'http':
      return getHttpGroup(importPath)
    case 'first-dir': {
      const relative = path.relative(scanRoot, absolutePath).replace(/\\/g, '/')
      const segments = relative.split('/')

      // 文件直接位于扫描根,无首级子目录 → 未分组(扁平)
      if (segments.length < 2) {
        return undefined
      }

      const rawDir = segments[0]!
      const group = toGroupName(rawDir)

      // 撞名断言:不同原始目录 PascalCase 后同名 → 报错而非静默合并
      const prevRawDir = rawDirByGroup.get(group)
      if (prevRawDir && prevRawDir !== rawDir) {
        throw new Error(
          `Service 分组名冲突: 目录 "${prevRawDir}" 与 "${rawDir}" 均映射为分组 "${group}",请调整目录命名`,
        )
      }
      rawDirByGroup.set(group, rawDir)

      return group
    }
  }
}

/**
 * 目录/路径段 → 分组名(PascalCase);要求为合法标识符,避免产出非法对象键
 */
function toGroupName(raw: string): string {
  const name = toPascalCase(raw)
  if (!/^[A-Z_$][\w$]*$/i.test(name)) {
    throw new Error(`Service 分组名 "${name}"(来自 "${raw}")不是合法的标识符,请调整目录命名`)
  }
  return name
}

/**
 * 从服务导入路径中提取分组名('http' 策略)
 *
 * 约定: <alias>/http/<group?>/.../<Name>Service.ts
 * group 为 http 下的第一级目录;若为 services(默认目录)则视为无分组。
 */
function getHttpGroup(importPath: string): string | undefined {
  const segments = importPath.split('/')
  const httpIndex = segments.indexOf(HTTP_DIR_SEGMENT)

  if (httpIndex === -1 || httpIndex + 1 >= segments.length) {
    return undefined
  }

  const group = segments[httpIndex + 1]!

  if (group === DEFAULT_SERVICE_DIR) {
    return undefined
  }

  return toGroupName(group)
}

/**
 * 断言组内(或全扁平)Service 无重名:重名会产出对象字面量重复键(TS1117/运行时静默覆盖)
 */
function assertUniqueServiceNames(services: ServiceItem[], groupName?: string): void {
  const seen = new Map<string, ServiceItem>()

  for (const service of services) {
    const prev = seen.get(service.name)
    if (prev) {
      throw new Error(
        `Service 重名: ${groupName
          ? `分组 "${groupName}" 下 `
          : ''}"${service.name}" 同时来自 ${prev.path} 与 ${service.path},请调整生成配置(serviceResolve)或启用 groupStrategy 分组`,
      )
    }
    seen.set(service.name, service)
  }
}

/**
 * 断言 serviceMap 顶层键唯一:分组名与扁平 Service 名共享顶层命名空间
 */
function assertUniqueTopLevelKeys(groups: GroupItem[], flatServices: ServiceItem[]): void {
  const keys = new Map<string, string>()
  const register = (key: string, source: string) => {
    const prev = keys.get(key)
    if (prev) {
      throw new Error(`serviceMap 顶层键冲突: "${key}" 同时来自 ${prev} 与 ${source}`)
    }
    keys.set(key, source)
  }

  for (const group of groups) {
    register(group.name, `分组 "${group.name}"`)
  }
  for (const service of flatServices) {
    register(service.name, `Service "${service.path}"`)
  }
}

/**
 * 断言虚拟模块 import 局部绑定名唯一:分组绑定为 `${group}_${name}`,扁平绑定为 `name`。
 * 组间因组名唯一(assertUniqueTopLevelKeys)而天然不撞,唯一可能的冲突是
 * 扁平名恰好等于某个「组名_服务名」(如扫描根存在 DsoService_AuthService.ts 且
 * DsoService 组内有 AuthService.ts),该场景会产出重复局部绑定 → 模块不可解析,
 * 故启动期显式报错,而非交给打包器抛出难定位的 parse 错误
 */
function assertUniqueImportBindings(groups: GroupItem[], flatServices: ServiceItem[]): void {
  const groupedBindings = new Map<string, string>()

  for (const group of groups) {
    for (const service of group.services) {
      groupedBindings.set(`${group.name}_${service.name}`, `分组 "${group.name}" 下 "${service.name}"`)
    }
  }

  for (const service of flatServices) {
    const prev = groupedBindings.get(service.name)
    if (prev) {
      throw new Error(
        `Service 局部绑定冲突: 扁平 "${service.name}" 与 ${prev} 的导入别名重名,请调整生成配置(serviceResolve)或目录命名`,
      )
    }
  }
}

/**
 * 获取分组列表
 * @param services
 * @returns GroupItem[]
 */
function getServiceGroups(services: ServiceItem[]): GroupItem[] {
  const map = new Map<string, GroupItem>()

  for (const service of services) {
    if (!service.group)
      continue

    let group = map.get(service.group)

    if (!group) {
      group = { name: service.group, services: [] }
      map.set(service.group, group)
    }

    group.services.push(service)
  }

  return [
    ...map.values(),
  ]
}

/**
 * 渲染虚拟模块代码
 * @param groups 分组 Service(可能为空)
 * @param flatServices 未分组 Service(可能为空)
 */
function renderCode(groups: GroupItem[], flatServices: ServiceItem[]): string {
  const template = Handlebars.compile(generateCodeTemplate)

  return template({
    groups: groups.length ? groups : undefined,
    flatServices: flatServices.length ? flatServices : undefined,
  })
}

/**
 * 生成类型声明文件
 * @param groups 分组 Service(可能为空)
 * @param flatServices 未分组 Service(可能为空)
 * @param options
 * @param config
 */
function generateDeclare(
  groups: GroupItem[],
  flatServices: ServiceItem[],
  options: PluginOptions,
  config: ResolvedConfig,
) {
  const template = Handlebars.compile(generateDeclareTemplate)
  const content = template({
    groups: groups.length ? groups : undefined,
    flatServices: flatServices.length ? flatServices : undefined,
    MODULE_ID,
  })

  // 目标声明文件路径
  const declarationFilePath = path.resolve(
    config.root,
    typeof options.dts === 'string'
      ? options.dts
      : DECLARATION_FILE,
  )

  // 确保目标目录存在
  const declarationFileDir = path.dirname(declarationFilePath)
  if (!fs.existsSync(declarationFileDir)) {
    fs.mkdirSync(declarationFileDir, { recursive: true })
  }

  fs.writeFileSync(
    declarationFilePath,
    content.replace(/\r\n/g, '\n'),
    'utf-8',
  )
}
