export function getCamelName(value: string) {
  return value
    .replace(/^[^a-zA-Z]+/g, '')
    .replace(/[^\w-]+/g, '-')
    .replace(/^\S/, (s) => s.toUpperCase())
    .trim()
}
