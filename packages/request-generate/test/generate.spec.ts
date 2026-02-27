import { download, generate } from '../src'

const exportServices = {
  serviceResolve({ object, tags }: any) {
    // const tag =   object.tags
    const tag = tags.find((tag: any) => tag.name === object.tags?.[0])

    if (tag && tag.description) {
      return tag.description
        .replace(/\s/g, '')
        .replace(/Controller$/g, '')
    }
    else {
      return 'default'
    }
  },
  responseType: 'promise' as const,
  excludeQueryParams: [
    'pageNumber',
    'pageSize',
    'paged',
    'unpaged',
    'order',
    'sort',
    'offset',
  ],
}

describe('测试请求生成逻辑', () => {
  it('测试OpenAPIV3', async () => {
    await download({
      gateway: 'https://gateway.local.xbt.sx.cn/dso-org-service',
      openapi: '/v3/api-docs',
      output: './generated/v3',
      exportModels: true,
    })

    await generate({
      gateway: 'https://gateway.local.xbt.sx.cn/dso-org-service',
      openapi: '/v3/api-docs',
      output: './generated/v3',
      exportModels: true,
      exportServices,
    })

    expect(true).toBe(true)
  })

  it('测试OpenAPIV2', async () => {
    await download({
      gateway: 'https://gateway.local.xbt.sx.cn',
      applications: {
        'mall-service': 'xbt-platform-mall-service',
        'file-service': 'xbt-platform-file-service',
      },
      openapi: '/v2/api-docs',
      output: './generated/v2',
      exportModels: true,
    })

    await generate({
      gateway: 'https://gateway.local.xbt.sx.cn',
      applications: {
        'mall-service': 'xbt-platform-mall-service',
        'file-service': 'xbt-platform-file-service',
      },
      openapi: '/v2/api-docs',
      output: './generated/v2',
      exportModels: true,
      exportServices,
    })

    expect(true).toBe(true)
  })
})
