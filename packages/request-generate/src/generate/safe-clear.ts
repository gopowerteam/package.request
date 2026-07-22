import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 标记文件名,用于识别 request-generate 生成的目录
 */
const GENERATED_MARKER = '.generated'

/**
 * 安全清空目标目录
 *
 * 保护策略:
 * 1. 始终拒绝清空 cwd 或 cwd 之外的路径(即使 force=true)
 * 2. 仅当目录中存在 `.generated` 标记文件时才允许清空
 *    (避免误删用户已存在的同名目录)
 * 3. 传入 force=true 可跳过标记检查(用于旧项目迁移,
 *    即目录由旧版本生成、尚无 .generated 标记的场景)
 *
 * @param targetDir 待清空的目录路径
 * @param force 是否跳过 `.generated` 标记检查(默认 false)
 * @returns 标记文件的完整路径(供调用方在重建目录后写入)
 */
export function safeClearGeneratedDir(targetDir: string, force = false): string {
  const resolved = path.resolve(targetDir)
  const cwd = process.cwd()

  // 始终拒绝清空 cwd 或不在 cwd 内的路径(不受 force 影响)
  if (resolved === cwd || !resolved.startsWith(`${cwd}${path.sep}`)) {
    throw new Error(`输出路径必须在项目目录内: ${resolved}`)
  }

  const markerPath = path.join(resolved, GENERATED_MARKER)

  if (fs.existsSync(resolved)) {
    // 已存在目录但非本工具生成 → 拒绝清空,避免误删用户数据
    // force=true 时跳过此检查(用于旧项目迁移)
    if (!force && !fs.existsSync(markerPath)) {
      throw new Error(
        `目标目录已存在且非生成产物,拒绝清空(请手动确认后删除,或在配置中设置 forceClear: true): ${resolved}`,
      )
    }
    fs.rmSync(resolved, { recursive: true, force: true })
  }

  fs.mkdirSync(resolved, { recursive: true })
  return markerPath
}

/**
 * 写入标记文件,标识目录由本工具生成
 */
export function writeGeneratedMarker(markerPath: string) {
  fs.writeFileSync(markerPath, String(Date.now()), 'utf-8')
}
