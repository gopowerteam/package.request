import generate from '../src'

describe('测试请求生成逻辑', () => {
  test('测试OpenAPIV3', async () => {
    await generate({
      gateway: 'https://mall-service.gopowerteam.cn/admin',
      openapi: '/api-docs',
      output: './generated/v3',
      exportModels: true,
      exportServices: {
        responseType: 'promise',
        excludeQueryParams: ['page', 'size', 'order']
      }
    })

    expect(true).toBe(true)
  })

  test('测试OpenAPIV2', async () => {
    await generate({
      gateway: 'https://gateway.local.xbt-dev.top',
      applications: {
        'mall-service': 'xbt-platform-mall-service',
        'customer-service': 'xbt-platform-sales-customer-service'
      },
      openapi: '/v2/api-docs',
      output: './generated/v2',
      exportModels: true,
      exportServices: {
        serviceResolve({ object, tags }) {
          // const tag =   object.tags
          const tag = tags.find((tag) => tag.name === object.tags?.[0])

          if (tag && tag.description) {
            return tag.description
              .replace(/\s/g, '')
              .replace(/Controller$/g, '')
          } else {
            return 'default'
          }
        },
        responseType: 'promise',
        excludeQueryParams: [
          'pageNumber',
          'pageSize',
          'paged',
          'unpaged',
          'order',
          'sort',
          'offset'
        ]
      }
    })

    expect(true).toBe(true)
  })
})
