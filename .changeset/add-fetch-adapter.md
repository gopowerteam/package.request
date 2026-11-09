---
"@gopowerteam/request": patch
---

新增 `FetchAdapter`，基于原生 `fetch` 实现，与 `AxiosAdapter` 行为对齐，可直接平行替换：共用查询参数序列化与 `timeout` 语义，支持相同的 Content-Type 推断、取消标记与异常转换。新增 `RequestSetupConfig.fetch` / `responseType` 配置项，并从 `@gopowerteam/request/adapters` 导出 `FetchAdapter`、`FetchAdapterConfig`、`ResponseError`。
