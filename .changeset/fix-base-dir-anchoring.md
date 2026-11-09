---
'@gopowerteam/request-generate': minor
---

路径解析基准统一锚定 baseDir(配置文件所在目录)

- `.request` 快照/账本、`output` 相对路径、宿主版本校验,全部以配置文件所在目录为解析基准,不再依赖 `process.cwd()`;vite 进程 cwd ≠ 仓库根的 monorepo 场景恢复可用
- `GenerateOptions` 新增可选 `baseDir`(配置显式声明优先);`loadConfigFile` 自动注入
- `safeClearGeneratedDir` 清空守卫同步改按 baseDir 判定(原按 cwd,会导致锚定后的产物目录被误拒)
- vite 插件扫描目录口径对齐:显式 `dir` 按 vite root,回退 `output` 按 baseDir,消除扫描与产物分叉
- 行为变化:曾从非配置文件目录的 cwd 运行过 CLI 的项目,快照/账本位置随锚定迁移,首次运行可能全量重新生成
