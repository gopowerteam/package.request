import type { Operation } from '../entities/operation'

export const includeQueryParams: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'include-query-params',
  fn(operations: Operation[], options: Handlebars.HelperOptions) {
    if (operations.some(x => x.parametersQuery.length > 0)) {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
  },
}
