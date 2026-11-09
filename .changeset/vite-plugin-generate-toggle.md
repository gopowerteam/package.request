---
'@gopowerteam/request-generate': minor
---

vite 插件新增 generate / throwOnError 选项 (#7)

- `generate?: boolean`(缺省 `true`):设为 `false` 时跳过进程内 `Generate.startup`(交给外部管线,如 CI 预先运行 request-download/request-generate),插件仅扫描产物 + 装配虚拟模块/d.ts
- `throwOnError?: boolean`(缺省 `true`):设为 `false` 时生成/扫描失败降级为 `console.warn` + 可加载的空实现(useRequest 调用时抛出带原因链的明确运行时错误),「前端先于后端启动」的联调顺序不再被 dev server 启动失败阻塞;降级模式下不写出 d.ts(TS 侧显式缺模块声明优于静默空类型)
