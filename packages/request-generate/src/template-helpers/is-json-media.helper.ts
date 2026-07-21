import { classifyMediaType } from '../utils/get-media-type'

/**
 * Handlebars helper:判定 media-type 字符串是否属于 JSON 家族
 * 用于模板跳过 JSON 的 headers 注入(JSON 走 axios 实例默认的 application/json)
 */
export const isJsonMediaHelper: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'is-json-media',
  fn(mediaType: string | undefined): boolean {
    if (!mediaType) {
      return false
    }
    return classifyMediaType(mediaType) === 'json'
  },
}
