/**
 * @type {import('@gopowerteam/request-generate').GenerateOptions}
 */
module.exports = {
  gateway: 'https://gateway.local.xbt.sx.cn',
  applications: {
    'mall-service': 'xbt-platform-mall-service',
    'file-service': 'xbt-platform-file-service',
  },
  openapi: '/v2/api-docs',
  output: './generated',
  exportModels: true,
  logger: true,
  appendService: false,
  exportServices: {
    responseType: 'observable',
    excludeQueryParams: ['page', 'size', 'order'],
  },
}
