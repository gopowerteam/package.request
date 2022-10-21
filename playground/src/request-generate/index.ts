import generate from '@gopowerteam/request-generate'

generate({
  gateway: 'https://mall-service.gopowerteam.cn/admin',
  openapi: '/api-docs',
  output: './src/generated',
  logger: true,
  exportModels: true,
  exportServices: {
    responseType: 'promise',
    excludeQueryParams: ['page', 'size', 'order']
  }
})
