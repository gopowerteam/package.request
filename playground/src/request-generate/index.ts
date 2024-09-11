import generate from '@gopowerteam/request-generate'

generate({
  gateway: 'https://gateway.local.xbt-dev.top',
  openapi: '/v2/api-docs',
  output: './src/generated',
  exportModels: true,
  applications: {
    'wxcp-service': {
      key: 'xbt-platform-wxcp-service',
      openapi: '/v2/api-docs',
    },
    'mall-service': {
      key: 'xbt-platform-mall-service',
      openapi: '/v2/api-docs',
    },
    'file-service': {
      key: 'xbt-platform-file-service',
      openapi: '/v2/api-docs',
    },
    'material-service': {
      key: 'xbt-platform-material-service',
      openapi: '/v2/api-docs',
    },
    'sales-customer-service': {
      key: 'xbt-platform-sales-customer-service',
      openapi: '/v3/api-docs',
    },
    'communication-service': {
      key: 'xbt-platform-communication-service',
      openapi: '/v3/api-docs',
    },
  },
  logger: true,
  exportServices: {
    serviceResolve({ object, tags }) {
      const tag = tags.find(tag => tag.name === object.tags?.[0])

      if (tag && tag.description) {
        return tag.description.replace(/\s/g, '').replace(/Controller$/g, '')
      }
      else {
        return 'default'
      }
    },
    operationResolve({ object }) {
      return object
        .operationId!.replace(/_*\d*$/g, '').replace(/Using(GET|POST|PUT|PATCH|DELETE)_*\d*$/g, '')
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
