export const toUpperHelper: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'to-upper',
  fn(v1: string, onlyFirst?: boolean) {
    if (onlyFirst) {
      return v1.replace(/^\S/, (s) => {
        return s.toUpperCase()
      })
    }
    else {
      return v1.toUpperCase()
    }
  },
}
