---
'@gopowerteam/request': minor
---

新增代码生成服务基类:

- **`GenerateRequestService`**(主入口导出):封装生成代码共用的请求分发逻辑——URL 模式返回 `toURL` 字符串,promise 模式返回 `send` 结果;生成的 Service 类将 extends 该基类
- **`ObservableGenerateRequestService`**(新子路径 `@gopowerteam/request/observable`):Observable 模式生成基类,数据分支经 rxjs `from()` 包装;URL 模式行为与 promise 版一致
- 新增可选 peer 依赖 `rxjs`(>=7):仅 `./observable` 子路径运行时需要,promise 模式宿主无需安装
- 最低 Node 版本与既有 API 均不变
