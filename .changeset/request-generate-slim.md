---
'@gopowerteam/request-generate': patch
---

生成代码瘦身与版本校验:

- **生成代码体积减少**:Service 类不再各自生成 `private request` 字段与 `generateRequest` 分发方法(约每文件 -25 行),改为 extends `@gopowerteam/request` 的共享基类;方法签名与调用方式完全不变
- **Observable 模式**:`from()` 包装逻辑上移至基类(`ObservableGenerateRequestService`);生成产物对 rxjs 仅为 type import,无运行时依赖
- **生成时版本校验**:自动检测宿主 `@gopowerteam/request` 版本,低于 `0.4.0` 时输出告警(不阻断);版本文件不可读时静默跳过
- **依赖变化**:`rxjs` 移至可选 peerDependencies(仅 Observable 模式需要);移除死依赖 `qs`/`@types/qs`
- **CLI 冷启动提速(~2.4s → ~0.27s)**:bin 命令改为 tsdown 预构建产物(`dist/generate.mjs`、`dist/download.mjs`),不再经 tsx 运行时启动
- **下载层 ETag 条件请求**:支持 `If-None-Match`/`If-Modified-Since`,网关支持时 304 跳过下载;本地文件输入改为直读
- **要求 `@gopowerteam/request >= 0.4.0`**(生成产物引用新基类)
