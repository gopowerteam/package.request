export const equalHelper: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'equal',
  fn(v1: unknown, v2: unknown, options: Handlebars.HelperOptions) {
    if (v1 === v2) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }
}
