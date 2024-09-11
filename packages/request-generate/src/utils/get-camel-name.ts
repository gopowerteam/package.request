export function getCamelName(value: string) {
  // 检测汉字
  // if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
  //   throw new Error(`[${value}]包含汉字无法转换`)
  // }

  return value
    .replace(/^[^a-z]+/gi, '')
    .replace(/\W+/g, '_')
    .replace(/[^\w-]+/g, '_')
    .replace(/^\S/, s => s.toUpperCase())
    .replace(/_[a-z]/gi, s => s.toUpperCase())
    .replace(/_/g, '')
    .trim()
}
