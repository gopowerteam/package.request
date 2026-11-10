/**
 * 虚拟模块/声明文件的集合级断言辅助:
 * 用集合而非整行 toContain,避免模板空白变化导致假绿/假红(#9 回归)。
 * 正则保持线性(`[^}]*` 后接字面量 `}`,无相邻可交换量化),规避超线性回溯。
 */

// 仅匹配 `export { ... }`(花括号再导出),不匹配 `export function` 等
const BRACKET_EXPORT = /^export \{([^}]*)\}/gm
// 生成码中 import 均独占一行(模板逐条输出),故可用行首锚定
const BRACKET_IMPORT = /^import \{([^}]*)\} from/gm

/** 取「对外名字」:`A as B` → `B`,`A` → `A` */
function extractAliasName(specifier: string): string {
  const trimmed = specifier.trim()
  const asIndex = trimmed.lastIndexOf(' as ')
  return asIndex === -1
    ? trimmed
    : trimmed.slice(asIndex + 4).trim()
}

/** 提取顶层具名导出的「对外名字」 */
export function exportedNames(code: string): string[] {
  return [
    ...code.matchAll(BRACKET_EXPORT),
  ].map(m => extractAliasName(m[1]!))
}

/** 提取 import 语句的「局部绑定名」 */
export function localBindings(code: string): string[] {
  return [
    ...code.matchAll(BRACKET_IMPORT),
  ]
    .flatMap(m => m[1]!.split(',').map(extractAliasName).filter(Boolean))
}

export function expectNoDuplicates(names: string[]): void {
  expect(names.length).toBe(new Set(names).size)
}
