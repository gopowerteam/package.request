export function getCamelName(value: string) {
  // 检测汉字
  // if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
  //   throw new Error(`[${value}]包含汉字无法转换`)
  // }

  return value
    .replace(/^[^a-zA-Z]+/g, '')
    .replace(/[^\w-]+/g, '_')
    .replace(/^\S/, (s) => s.toUpperCase())
    .replace(/_[a-zA-Z]/g, (s) => s.toUpperCase())
    .replace(/_/g, '')
    .trim()
}
