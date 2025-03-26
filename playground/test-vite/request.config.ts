import { defineConfig } from '@gopowerteam/request-generate'

export default defineConfig({
  gateway: 'https://gateway.local.xbt-dev.top',
  openapi: '/v3/api-docs',
  output: './src/http',
  exportModels: true,
  applications: {
    'file-service': {
      key: 'xbt-platform-file-service',
      openapi: '/v2/api-docs',
    },
    'mall-service': {
      key: 'xbt-platform-mall-service',
      openapi: '/v2/api-docs',
    },
  },
  logger: true,
  exportServices: {
    serviceResolve({ object, tags }) {
      const tagName = object.tags?.[0]

      if (!tagName) {
        return 'default'
      }

      if (/[\u4E00-\u9FA5]+/.test(tagName)) {
        const tag = tags.find(tag => tag.name === tagName)
        return tag && tag.description ? tag.description.replace(/\s/g, '').replace(/Controller$/g, '') : 'default'
      }
      else {
        return tagName
      }
    },
    operationResolve({ object }) {
      return object.operationId!
        .replace(/_*\d*$/g, '')
        .replace(/Using(GET|POST|PUT|PATCH|DELETE)_*\d*$/g, '')
    },
    responseType: 'promise',
    excludeQueryParams: [
      'pageNumber',
      'pageSize',
      'page',
      'size',
      'paged',
      'unpaged',
      'order',
      'sort',
      'offset',
    ],
  },
})
