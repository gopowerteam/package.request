import * as fs from 'fs'
import * as path from 'path'
import type { ResolvedConfig, Plugin } from 'vite'
import Handlebars from 'handlebars'
import { generateCodeTemplate, generateDeclareTemplate } from './templates'
// 虚拟模块ID
const MODULE_ID = 'virtual:request'
// 默认定义文件名
const DECLARATION_FILE = 'request.d.ts'

// vite配置项
let viteConfig: ResolvedConfig

type ServiceItem = {
  name: string
  group?: string
  path: string
}

type GroupItem = {
  name: string
  services: ServiceItem[]
}

type PluginOptions = {
  alias: string
  dir: string
  dts: string
}

/**
 * Request插件
 */
export default (options: PluginOptions): Plugin => {
  return {
    name: 'vite-plugin-request',
    enforce: 'pre',
    resolveId(id: string) {
      return id === MODULE_ID ? MODULE_ID : undefined
    },
    configResolved(config) {
      viteConfig = config
    },
    load(id: string) {
      if (id !== MODULE_ID) return
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
        return generateCode(services, groups)
      } else {
        return undefined
      }
    }
  }
}

/**
 * 生成服务路径
 * @param option
 * @returns
 */
function getServicePaths(options: PluginOptions) {
  const paths: string[] = []

  // 遍历目录
  const walk = (dir: string) => {
    fs.readdirSync(dir).forEach(function (file) {
      // 修正windows路径符号问题
      const fullpath = path.join(dir, file).replace(/\\/g, '/')
      const stat = fs.statSync(fullpath)

      if (stat.isFile() && fullpath.endsWith('Service.ts')) {
        paths.push(fullpath)
      } else if (stat.isDirectory()) {
        const subdir = path.join(dir, file)
        walk(subdir)
      }
    })
  }

  // 替换路径别名
  const { replacement } = viteConfig.resolve.alias.find(
    (alias) => alias.find === options.alias
  ) as any

  if (fs.existsSync(path.resolve(options.dir))) {
    walk(path.resolve(options.dir))
  }

  return paths.map((filepath) =>
    filepath.replace(replacement.replace(/\\/g, '/'), options.alias)
  )
}

/**
 * 生成服务项
 * @param paths
 * @returns
 */
function getServiceItems(paths: string[]): ServiceItem[] {
  const toCaseString = (str = '') =>
    str
      .replace(/-(\w)/g, (_, $1: string) => $1.toUpperCase())
      .replace(/^\S/, (s) => s.toUpperCase())

  return paths.map((filePath) => {
    const [name] =
      /[^\\]+(?=\.ts$)/.exec(toCaseString(path.basename(filePath))) || []

    const [group] =
      /(?<=^.\/http\/)(.*?)(?=\/.*?Service\.ts$)/.exec(filePath) || []

    return {
      name: toCaseString(name),
      group: group !== 'services' ? toCaseString(group) : undefined,
      path: filePath.replace(/\.ts$/g, '')
    }
  })
}

/**
 * 获取分组列表
 * @param services
 * @returns
 */
function getServiceGroups(services: ServiceItem[]) {
  return services.reduce<GroupItem[]>((r, s) => {
    if (!s.group) {
      return r
    }

    const group = r.find((x) => x.name === s.group) || {
      name: s.group,
      services: []
    }

    group.services.push(s)

    if (!r.find((g) => g === group)) {
      r.push(group)
    }

    return r
  }, [])
}

/**
 * 生成代码
 * @param services
 * @param options
 * @returns
 */
function generateCode(services: ServiceItem[], groups: GroupItem[]) {
  // 生成模板
  const template = Handlebars.compile(generateCodeTemplate)
  // 编译模板内容
  return template({
    groups: groups.length ? groups : undefined,
    services
  })
}

/**
 * 生成代码
 * @param services
 * @param options
 * @returns
 */
function generateDeclare(
  services: ServiceItem[],
  groups: GroupItem[],
  options: PluginOptions
) {
  // 生成模板
  const template = Handlebars.compile(generateDeclareTemplate)
  // 编译模板内容
  const content = template({
    groups: groups.length ? groups : undefined,
    services,
    MODULE_ID
  })

  fs.writeFileSync(
    path.resolve(viteConfig.root, options.dts ?? DECLARATION_FILE),
    content.replace(/\r\n/g, '\n'),
    'utf-8'
  )
}
