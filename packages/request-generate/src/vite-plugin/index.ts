import type { PluginOption, ResolvedConfig } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import Handlebars from 'handlebars'
import { Generate } from '../generate'
import { loadConfigFile } from '../load-config'
import { generateCodeTemplate, generateDeclareTemplate } from './templates'

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

  return {
    name: 'request-generate',
    enforce: 'pre',
    configResolved(config) {
      viteConfig = config
    },
    async buildStart() {
      if (!viteConfig) {
        throw new Error('Vite 配置尚未解析完成,无法执行 request-generate 插件')
      }

      // 1. 加载 request-generate 配置(进程内,支持 .ts)
      const { default: generateOptions } = await loadConfigFile(
        options.configFile,
        viteConfig.root,
      )

      // 2. 进程内生成接口文件(替代子进程调用)
      try {
        await Generate.startup(generateOptions)
      }
      catch (error) {
        throw new Error('request-generate 接口生成失败', { cause: error })
      }

      // 3. 扫描产物并生成虚拟模块代码 / 类型声明
      const scanDir = options.dir ?? generateOptions.output
      if (!scanDir) {
        throw new Error(
          '未指定扫描目录,请在插件选项 dir 或 request.config.ts 的 output 中配置',
        )
      }

      const paths = getServicePaths(
        { ...options, dir: scanDir },
        viteConfig,
      )
      const services = getServiceItems(paths)
      const groups = getServiceGroups(services)

      if (services.length > 0) {
        generatedCode = renderCode(services, groups)

        if (options.dts !== false) {
          generateDeclare(services, groups, options, viteConfig)
        }
      }
    },
    resolveId(id: string) {
      return id === MODULE_ID ? MODULE_ID : undefined
    },
    load(id: string) {
      if (id !== MODULE_ID)
        return

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
 * 生成服务路径
 * @param options PluginOptions(需包含 dir)
 * @param config Vite 已解析配置
 * @returns string[]
 */
function getServicePaths(
  options: PluginOptions & { dir: string },
  config: ResolvedConfig,
) {
  const paths: string[] = []

  // 遍历目录
  const walk = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
      // 修正windows路径符号问题
      const fullpath = path.join(dir, file).replace(/\\/g, '/')
      const stat = fs.statSync(fullpath)

      if (stat.isFile() && fullpath.endsWith('Service.ts')) {
        paths.push(fullpath)
      }
      else if (stat.isDirectory()) {
        walk(path.join(dir, file))
      }
    })
  }

  // 查找别名配置,缺失时给出明确错误
  const aliasMatch = config.resolve.alias.find(
    alias => alias.find === options.alias,
  )

  if (!aliasMatch) {
    throw new Error(
      `Vite alias "${options.alias}" 未在配置中找到,请在 vite.config 中配置 resolve.alias`,
    )
  }

  const replacement = aliasMatch.replacement.replace(/\\/g, '/')
  const targetDir = path.resolve(config.root, options.dir)

  if (fs.existsSync(targetDir)) {
    walk(targetDir)
  }

  return paths.map(filepath => filepath.replace(replacement, options.alias))
}

/**
 * 生成服务项
 * @param paths
 * @returns ServiceItem[]
 */
function getServiceItems(paths: string[]): ServiceItem[] {
  return paths.map((filePath) => {
    const name = toPascalCase(path.basename(filePath, '.ts'))

    return {
      name,
      group: getServiceGroup(filePath),
      path: filePath.replace(/\.ts$/g, ''),
    }
  })
}

/**
 * 从服务路径中提取分组名
 *
 * 约定: <alias>/http/<group?>/.../<Name>Service.ts
 * group 为 http 下的第一级目录;若为 services(默认目录)则视为无分组。
 */
function getServiceGroup(filePath: string): string | undefined {
  const segments = filePath.split('/')
  const httpIndex = segments.indexOf(HTTP_DIR_SEGMENT)

  if (httpIndex === -1 || httpIndex + 1 >= segments.length)
    return undefined

  const group = segments[httpIndex + 1]

  if (group === DEFAULT_SERVICE_DIR)
    return undefined

  return toPascalCase(group)
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

  return [...map.values()]
}

/**
 * 渲染虚拟模块代码
 * @param services
 * @param groups
 */
function renderCode(services: ServiceItem[], groups: GroupItem[]): string {
  const template = Handlebars.compile(generateCodeTemplate)

  return template({
    groups: groups.length ? groups : undefined,
    services,
  })
}

/**
 * 生成类型声明文件
 * @param services
 * @param groups
 * @param options
 * @param config
 */
function generateDeclare(
  services: ServiceItem[],
  groups: GroupItem[],
  options: PluginOptions,
  config: ResolvedConfig,
) {
  const template = Handlebars.compile(generateDeclareTemplate)
  const content = template({
    groups: groups.length ? groups : undefined,
    services,
    MODULE_ID,
  })

  // 目标声明文件路径
  const declarationFilePath = path.resolve(
    config.root,
    typeof options.dts === 'string' ? options.dts : DECLARATION_FILE,
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
