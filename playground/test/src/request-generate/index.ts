import type { GenerateOptions } from '@gopowerteam/request-generate'
import { download, generate } from '@gopowerteam/request-generate'

const options: GenerateOptions = {
  gateway: 'https://gateway.bdso.xbt.sx.cn',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  applications: {
    'dso-service': {
      key: 'org-service',
      openapi: '/v3/api-docs',
    },
    'file-service': {
      key: 'file-service',
      openapi: '/v3/api-docs',
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
        .replace(/_\d+$/g, '')
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
}

async function startup() {
  await download(options)
  await generate(options)
}

startup()
