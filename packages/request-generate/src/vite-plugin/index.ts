import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import Handlebars from 'handlebars'
import type { PluginOption, ResolvedConfig } from 'vite'
import { generateCodeTemplate, generateDeclareTemplate } from './templates'

// 虚拟模块ID
const MODULE_ID = 'virtual:request'
// 默认定义文件名
const DECLARATION_FILE = 'request.d.ts'

// vite配置项
let viteConfig: ResolvedConfig

interface ServiceItem {
  name: string
  group?: string
  path: string
}

interface GroupItem {
  name: string
  services: ServiceItem[]
}

interface PluginOptions {
  alias: string
  dir: string
  dts: string
}

let GerneratedCodeStr: string = ''

function genretateDeclareAndCode(options: PluginOptions) {
  // 生成文件列表
  const paths = getServicePaths(options)
  // 生成服务列表
  const services = getServiceItems(paths)
  // 生成分组列表
  const groups = getServiceGroups(services)

  if (services && services.length) {
    // 生成定义
    generateDeclare(services, groups, options)
    // 生成代码
    generateCode(services, groups)
  }
}

function generateRequestCode() {
  const generateScript = path.resolve(viteConfig.root, 'node_modules', '.bin', 'request-generate')
  execSync(`${generateScript}`)
}

/**
 * Request插件
 */
export default (options: PluginOptions): PluginOption => {
  return {
    name: 'vite-plugin-vue-request',
    enforce: 'pre',
    configResolved(config) {
      viteConfig = config
    },
    resolveId(id: string) {
      return id === MODULE_ID ? MODULE_ID : undefined
    },
    async buildStart() {
      // 生成接口文件
      // TODO: 执行bin/generate.ts
      await generateRequestCode()
      // 生成定义文件以及代码文件
      await genretateDeclareAndCode(options)
    },
    load(id: string) {
      if (id !== MODULE_ID)
        return

      return GerneratedCodeStr
    },
  }
}

/**
 * 生成服务路径
 * @param options PluginOptions
 * @returns string[]
 */
function getServicePaths(options: PluginOptions) {
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
        const subdir = path.join(dir, file)
        walk(subdir)
      }
    })
  }

  // 替换路径别名
  const { replacement } = viteConfig.resolve.alias.find(
    alias => alias.find === options.alias,
  ) as any

  if (fs.existsSync(path.resolve(options.dir))) {
    walk(path.resolve(options.dir))
  }

  return paths.map(filepath =>
    filepath.replace(replacement.replace(/\\/g, '/'), options.alias),
  )
}

/**
 * 生成服务项
 * @param paths
 * @returns ServiceItem[]
 */
function getServiceItems(paths: string[]): ServiceItem[] {
  const toCaseString = (str = '') =>
    str
      .replace(/-(\w)/g, (_, $1: string) => $1.toUpperCase())
      .replace(/^\S/, s => s.toUpperCase())

  return paths.map((filePath) => {
    const [name]
      = /[^\\]+(?=\.ts$)/.exec(toCaseString(path.basename(filePath))) || []

    const [group]
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      = /(?<=^.\/http\/)(.*?)(?=\/.*?Service\.ts$)/.exec(filePath) || []

    return {
      name: toCaseString(name),
      group: group !== 'services' ? toCaseString(group) : undefined,
      path: filePath.replace(/\.ts$/g, ''),
    }
  })
}

/**
 * 获取分组列表
 * @param services
 * @returns GroupItem[]
 */
function getServiceGroups(services: ServiceItem[]) {
  return services.reduce<GroupItem[]>((r, s) => {
    if (!s.group) {
      return r
    }

    const group = r.find(x => x.name === s.group) || {
      name: s.group,
      services: [],
    }

    group.services.push(s)

    if (!r.find(g => g === group)) {
      r.push(group)
    }

    return r
  }, [])
}

/**
 * 生成代码
 * @param services
 * @param groups
 * @returns string
 */
function generateCode(services: ServiceItem[], groups: GroupItem[]) {
  // 生成模板
  const template = Handlebars.compile(generateCodeTemplate)
  // 编译模板内容
  GerneratedCodeStr = template({
    groups: groups.length ? groups : undefined,
    services,
  })
}

/**
 * 生成代码
 * @param services
 * @param groups
 * @param options
 */
function generateDeclare(
  services: ServiceItem[],
  groups: GroupItem[],
  options: PluginOptions,
) {
  // 生成模板
  const template = Handlebars.compile(generateDeclareTemplate)
  // 编译模板内容
  const content = template({
    groups: groups.length ? groups : undefined,
    services,
    MODULE_ID,
  })

  fs.writeFileSync(
    path.resolve(viteConfig.root, options.dts ?? DECLARATION_FILE),
    content.replace(/\r\n/g, '\n'),
    'utf-8',
  )
}
