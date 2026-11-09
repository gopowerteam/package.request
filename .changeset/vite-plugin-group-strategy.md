---
'@gopowerteam/request-generate': minor
---

vite 插件新增 groupStrategy 分组策略与重名/撞名防护 (#5)

- `groupStrategy?: 'http' | 'first-dir' | 'none'`(缺省 `'http'`,完全向后兼容):
  - `'first-dir'`:按扫描目录下第一级子目录分组,适配多应用布局 `<output>/<app>/services/`,使用形态 `useRequest((s) => s.DsoService.AuthService)`
  - `'none'`:强制扁平
- 跨应用 Service 重名不再产出 TS1117 / 运行时静默覆盖,改为启动期明确报错:组内重名、分组名撞名(不同目录 PascalCase 后同名)、serviceMap 顶层键冲突(组名 ∪ 扁平名)、非法标识符分组名
- 修复:分组与扁平 Service 混合时,未分组 Service 被模板静默丢弃的问题(现为混合渲染,虚拟模块与 d.ts 同步)
