/**
 * @type {import('@gopowerteam/request-generate').GenerateOptions}
 */
module.exports = {
  gateway: 'https://mall-service.gopowerteam.cn/admin',
  openapi: '/api-docs',
  output: './generated',
  exportModels: true,
  logger: true,
  appendService: false,
  exportServices: {
    responseType: 'observable',
    excludeQueryParams: ['page', 'size', 'order']
  }
}
