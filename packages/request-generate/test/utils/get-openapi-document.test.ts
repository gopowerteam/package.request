import { describe, expect, it } from 'vitest'
import { getOpenApiDocument } from '../../src/utils/get-openapi-document'

describe('getOpenApiDocument - 输入校验', () => {
  it('空字符串应抛出明确错误', async () => {
    await expect(getOpenApiDocument('')).rejects.toThrow(/OpenAPI 输入路径不能为空/)
  })

  it('仅空白字符应抛出明确错误', async () => {
    await expect(getOpenApiDocument('   ')).rejects.toThrow(/OpenAPI 输入路径不能为空/)
  })

  it('非字符串(null)应抛出明确错误', async () => {
    // @ts-expect-error 故意传入非字符串验证运行时守卫
    await expect(getOpenApiDocument(null)).rejects.toThrow(/OpenAPI 输入路径不能为空/)
  })
})
