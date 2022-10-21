import generate from '../src'

describe('测试请求生成逻辑', () => {
  test('测试默认接口生成', async () => {
    await generate({
      gateway: 'https://mall-service.gopowerteam.cn/admin',
      openapi: '/api-docs',
      output: './generated',
      exportModels: true,
      exportServices: {
        responseType: 'observable',
        excludeQueryParams: ['page', 'size', 'order']
      }
    })

    expect(true).toBe(true)
  })
})
