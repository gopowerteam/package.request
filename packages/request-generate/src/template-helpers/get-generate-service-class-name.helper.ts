export const getGenerateServiceClassName: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'getGenerateServiceClassName',
  fn(responseType?: unknown) {
    return responseType === 'observable'
      ? 'ObservableGenerateRequestService'
      : 'GenerateRequestService'
  },
}
