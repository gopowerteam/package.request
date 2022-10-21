export const isArrayHelper: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'is-array',
  fn(v1: unknown, options: Handlebars.HelperOptions) {
    if (Array.isArray(v1)) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }
}
