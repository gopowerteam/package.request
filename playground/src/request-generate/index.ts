import generate from '@gopowerteam/request-generate'

generate({
  gateway: 'https://mall-service.gopowerteam.cn/admin',
  openapi: '/api-docs',
  output: './generated',
  exportModels: true,
  exportServices: {
    responseType: 'observable',
    excludeQueryParams: ['page', 'size', 'order']
  }
})
