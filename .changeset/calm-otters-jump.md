---
'@gopowerteam/request': minor
'@gopowerteam/request-generate': minor
---

支持 multipart/binary/urlencoded/text 等 media 类型的 Content-Type 自动注入。

## @gopowerteam/request

- AxiosAdapter 新增按运行时 body 类型推断 Content-Type 的逻辑
  - FormData / URLSearchParams → 设置 `Content-Type: false`,让浏览器/axios 自动补 boundary 与 charset
  - Blob → 兜底 `application/octet-stream`(B 端注入精确类型时不介入)
  - 调用方显式设置 Content-Type 时绝对优先(大小写不敏感守卫)
  - 其他类型(对象/数组/字符串/undefined)不写头,沿用 axios 实例默认的 `application/json`
- 新增 `src/utils/content-type.ts` 工具模块
- `RequestSendOptions.headers` / `RequestAdapterOptions.headers` 类型扩展为 `Record<string, string | boolean>`,以承载 axios `false` 哨兵语义(向后兼容)

## @gopowerteam/request-generate

- V3 parser 在选中"已知非 JSON media"时把 media-type 字符串透传到 `OperationParameter.mediaType`
- 模板 `export-service-operation.hbs` 对非 JSON 且非 multipart 的 body 自动注入 `headers: { 'Content-Type': '<media>' }`
- multipart/form-data 显式跳过静态头注入(boundary 必须由运行时计算)
- 新增 `is-json-media` / `is-multipart` 两个 Handlebars helper
- JSON 家族 / `$ref` body / 未知 media → 不注入 headers,走 axios 实例默认的 application/json
