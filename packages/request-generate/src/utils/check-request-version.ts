import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 生成产物依赖的最低 @gopowerteam/request 版本
 * (生成代码 extends GenerateRequestService / ObservableGenerateRequestService)
 */
export const MIN_REQUEST_VERSION = '0.5.0'

/**
 * 解析 semver 版本号为 [主, 次, 补] 数字数组;非法格式返回 undefined
 */
function parseVersion(version: string): [number, number, number] | undefined {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    return undefined
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/**
 * 比较 a 是否低于 b(逐段数字比较);任一版本无法解析时返回 false(不告警)
 */
function isVersionLessThan(a: string, b: string): boolean {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa || !pb) {
    return false
  }
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pa[i]! < pb[i]!
    }
  }
  return false
}

/**
 * 检查宿主项目安装的 @gopowerteam/request 版本是否满足生成产物要求
 *
 * 仅告警不阻断;版本文件不可读(非标准安装布局等)时静默跳过。
 *
 * @param cwd 解析 node_modules 的基准目录(默认 process.cwd())
 */
export function checkRequestVersion(cwd = process.cwd()): void {
  try {
    const pkgPath = path.resolve(cwd, 'node_modules', '@gopowerteam', 'request', 'package.json')
    const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version?: string }

    if (typeof version === 'string' && isVersionLessThan(version, MIN_REQUEST_VERSION)) {
      console.warn(
        `[request-generate] 检测到 @gopowerteam/request 版本(${version})低于生成产物所需最低版本(${MIN_REQUEST_VERSION}),请升级后重新生成接口`,
      )
    }
  }
  catch {
    // 版本文件不可读时静默跳过
  }
}
