import { classifyMediaType } from '../utils/get-media-type'

/**
 * Handlebars helper:判定 media-type 字符串是否为 multipart/form-data 家族
 * 用于模板跳过 multipart 的静态 Content-Type 注入
 * (multipart 必须由运行时 axios/浏览器计算 boundary)
 */
export const isMultipartHelper: {
  name: string
  fn: Handlebars.HelperDelegate
} = {
  name: 'is-multipart',
  fn(mediaType: string | undefined): boolean {
    if (!mediaType) {
      return false
    }
    return classifyMediaType(mediaType) === 'multipart'
  },
}
