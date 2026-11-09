---
"@gopowerteam/request": patch
---

查询参数序列化改为内置实现，不再依赖 `qs`；`RequestSetupConfig.qs` 类型由 `IStringifyOptions` 改为 `QueryStringifyOptions`，新增 `sort` / `filter` 选项以对齐原 qs 行为。`AxiosAdapter` 与 `toURL()` 现共用 `DEFAULT_QUERY_OPTIONS`，避免默认配置漂移。
