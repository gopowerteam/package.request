import { download, generate } from '@gopowerteam/request-generate'
import type { GenerateOptions } from '@gopowerteam/request-generate'

const options: GenerateOptions = {
  gateway: 'https://gateway.local.xbt-dev.top',
  openapi: '/v2/api-docs',
  output: './src/generated/http',
  exportModels: true,
  applications: {
    'mall-service': {
      key: 'xbt-platform-mall-service',
      openapi: '/v2/api-docs',
    },
    'file-service': {
      key: 'xbt-platform-file-service',
      openapi: '/v2/api-docs',
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
}

async function startup() {
  await download(options)
  await generate(options)
}

startup()
