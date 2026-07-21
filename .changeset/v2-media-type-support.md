---
'@gopowerteam/request-generate': minor
---

V2 parser 全面对齐 V3 实现,补齐 media-type 与组合类型支持。

## V2 parse-schema-type - 组合类型支持(原 P0)

- 补齐 allOf/anyOf/oneOf 分支(与 V3 实现对齐),原本直接抛 "无法解析相应的schema" 错误
- 新分支位置在 object 兜底之前,避免 `{ type: 'object', allOf: [...] }` 静默丢失 allOf

## V2 media-type 支持(原 P1)

- Phase 1.1:将 `media-type.ts` 提取到共享位置 `src/utils/get-media-type.ts`,V2 与 V3 共用 `classifyMediaType` 与 `MEDIA_TYPE_TS_MAPPING`
- Phase 1.2:V2 `parseParametersBody` 支持 consumes 参数
  - 非_JSON consumes(multipart/binary/urlencoded/text)→ 整体类型映射 + mediaType 注入
  - JSON 家族 consumes → 走 schema 派生,不写 mediaType(走 axios 实例默认)
  - 多 consumes 共存时 JSON 优先(与 V3 行为一致)
  - `operation.consumes` 优先于 `document.consumes`
- Phase 1.3:V2 formData 参数聚合
  - formData 参数 + `multipart/form-data` consumes → 聚合为单一 FormData body
  - formData 参数 + 无 consumes / 非 multipart consumes → 静默丢弃(向后兼容)

## 行为契约

| V2 输入 | 旧行为 | 新行为 |
|---|---|---|
| allOf/anyOf/oneOf schema | 抛错 | 按 V3 规则解析为 `any` 或 `\|` 联合类型 |
| body + `['application/pdf']` consumes | schema 派生(如 string) | Blob + mediaType |
| body + JSON 家族 consumes | schema 派生 | 不变(JSON 守卫) |
| formData + multipart consumes | formData 被丢弃 | 聚合为 FormData body |
| formData + 无 consumes | 丢弃 | 静默丢弃(决策一致) |
