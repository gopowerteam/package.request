export const getGenerateServiceImportPath: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'getGenerateServiceImportPath',
  fn(responseType?: unknown) {
    // Observable 基类独立子路径导出,主入口不携带 rxjs 依赖(promise 模式宿主无需安装 rxjs)
    return responseType === 'observable'
      ? '@gopowerteam/request/observable'
      : '@gopowerteam/request'
  },
}
