# package.request

TypeScript monorepo（Turborepo + pnpm workspaces），发布两个 npm 包：

| 包 | 说明 |
| --- | --- |
| [`@gopowerteam/request`](./packages/request) | 基于 adapter 模式的 HTTP 客户端，内置 axios、插件中间件、请求中止（AbortService） |
| [`@gopowerteam/request-generate`](./packages/request-generate) | 从 OpenAPI/Swagger 文档生成类型安全 service 代码的 CLI + Vite 插件 |

各包的详细用法见其 README 与 `AGENTS.md`。

## 开发

```bash
pnpm install          # 安装依赖（仅允许 pnpm）
pnpm build            # 构建两个发布包（turbo，不过滤 playground）
pnpm test             # 运行全部测试（vitest）
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit（依赖 build 产物）
pnpm play:test        # playground/test：先跑 codegen 再跑请求脚本（tsx）
pnpm play:test-vite   # playground/test-vite 开发服务器（Vue 3 + Vite）
pnpm commit           # 交互式提交（中文约定式提交）
```

要求：Node ≥ 22.12，pnpm 11.x。

## 发布流程

1. `pnpm cs` 添加 changeset 并更新版本号
2. 推送到 `master` 后，`publish.yml` 由 changesets/action 自动构建并 `changeset publish --provenance`
3. 发布完成后自动触发 npmmirror 同步

详见各包 README 与 `AGENTS.md`（含架构、命令与约定说明）。
