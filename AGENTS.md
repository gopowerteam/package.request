<!-- Generated: 2026-02-27 | Updated: 2026-10-29 -->

# package.request

TypeScript monorepo (Turborepo + pnpm workspaces) publishing two packages:
`@gopowerteam/request` (HTTP client with adapter pattern) and
`@gopowerteam/request-generate` (CLI + Vite plugin that generates typed
services from OpenAPI/Swagger specs).

## Toolchain (verify before assuming)

- **pnpm 11.15.1** — enforced via `preinstall: only-allow pnpm`. Do NOT use npm/yarn.
  (Root `package.json` pins `packageManager: pnpm@11.15.1`; keep it in sync with CI.)
- **Node ≥ 24.11** (`engines`) — 这是必须的,不是建议值。工具链硬性要求:
  `tsdown@0.23` 需 24.11+、`vitest@5` 需 24.0+、`lint-staged@17` 需 22.22+、
  `@apidevtools/swagger-parser@13` 需 22.19+。CI (`ci.yml`) 只跑 **Node 24**,
  `publish.yml` 固定 `24.11`;不再做多版本矩阵。
- **TypeScript ^6.0.3**, target `ESNext`, `moduleResolution: bundler`, `strict: true`,
  `noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns` on.
  **不要升到 TypeScript 7** —— TS7 是原生 Go 编译器,不再提供 `typescript/lib/tsc` 内部路径,
  `vue-tsc` 会直接崩(`ERR_PACKAGE_PATH_NOT_EXPORTED`),`typescript-eslint` 也会拒绝加载
  (报 `typescript-eslint does not support TS 7.0`),ESLint 全链路失效。
- **Bundler is `tsdown`** (NOT `tsup` — the old docs were wrong). Each package has its own
  `tsdown.config.{ts,mts}`. Do not switch packages to tsup.
- **ESLint 10** with `@antfu/eslint-config` 10.0.0 (`eslint.config.mjs`, flat config, no `.eslintrc`).
- **Vitest 5** with `globals: true`, `environment: 'node'`. Tests rely on global `describe/it/expect`.
- Registry mirror: `pnpm-workspace.yaml` pins `https://registry.npmmirror.com`.
  Publishing targets `registry.npmjs.org` (`publishConfig`).

## Workspace layout

| Path                           | Role                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `packages/request/`            | `@gopowerteam/request` — adapter-based HTTP client, axios built-in   |
| `packages/request-generate/`   | `@gopowerteam/request-generate` — OpenAPI → TS codegen CLI + plugin  |
| `apps/playground-test/`       | `playground-test` — tsx scripts exercising both packages             |
| `apps/playground-test-vite/`  | `playground-test-vite` — Vue 3 + Vite app for manual plugin testing  |
| `apps/docs/`                  | `request-docs` — VuePress 2 documentation site for both packages     |

Each `packages/*` has its **own `AGENTS.md`** with package-specific architecture (entrypoints,
entities, parser layout, template helpers). Read the relevant child file before editing that package.

### Package entrypoints (dual exports — do not break)

`@gopowerteam/request` (`tsdown.config.ts`):
- `.` → `src/index.ts` (ESM + CJS + dts)
- `./adapters` → `src/adapters/index.ts` (exports both `AxiosAdapter` and `FetchAdapter` —
  行为对齐的两种实现,可直接平行替换;共用 `DEFAULT_QUERY_OPTIONS` 序列化与 `timeout` 语义)
- `./plugins` → `src/plugins/index.ts` (exports `AbortService` — a `RequestPlugin` giving each
  instance a cancel scope: it injects an `AbortController` signal in `before`, `abort()` kills
  that instance's in-flight requests)
- `./observable` → `src/observable/generate-request-service.ts` (`ObservableGenerateRequestService` —
  代码生成 Observable 模式基类;唯一依赖 rxjs 的入口,promise 模式宿主无需安装 rxjs)
- `axios` and `rxjs` are marked `neverBundle` — never bundle them.

`@gopowerteam/request-generate` (`tsdown.config.mts`):
- `.` → `src/index.ts` (ESM only, `platform: node`, `target: node16`)
- `./vite-plugin` → `src/vite-plugin/index.ts`
- Ships **two CLIs** registered as `bin`: `request-generate` and `request-download` (`bin/*.mts`).
- `rxjs`, `axios`, `handlebars`, `@apidevtools/swagger-parser`, `tsx`, `vite` are `neverBundle`.
- **Templates are copied** from `src/templates/` → `dist/` (non-flat) at build time.
  Editing a template requires a rebuild before the CLI picks it up.

## Commands

```bash
pnpm install                 # install (also runs husky setup via prepare)

pnpm build                   # turbo build, packages only (filters @gopowerteam/*)
pnpm dev                     # turbo dev (watch), persistent
pnpm lint                    # turbo lint
pnpm typecheck               # tsc --noEmit per package (turbo; dependsOn ^build)

pnpm test                    # vitest run (root config: all packages)
pnpm test:watch              # vitest
pnpm vitest run packages/request/test/request-service.test.ts   # one file
pnpm vitest run -t "pattern"                                     # by test name

pnpm play:test               # playground-test dev: codegen script, then request script (tsx)
pnpm play:test-vite          # apps/playground-test-vite dev server (vite)
pnpm docs:dev                # apps/docs VuePress dev server
pnpm docs:build              # apps/docs site build (dead-link check included)

pnpm --filter @gopowerteam/request build                       # single package
pnpm --filter @gopowerteam/request-generate test
```

Notes:
- `turbo.json` disables build cache (`"cache": false`). Rebuilds always run from scratch.
- Root `typecheck` = `pnpm -r --filter '@gopowerteam/*' exec tsc --noEmit` (topological
  order, run AFTER `pnpm build`). Deliberately NOT turbo: turbo's `typecheck` + `^build`
  raced with tsdown `clean:true` wiping `request/dist` mid-typecheck (flaky CI TS2307).
- The root `vitest.config.ts` only discovers `packages/*/test/**/*.{test,spec}.ts`.
  Playground files are **not** picked up by `pnpm test`.
- `packages/request` tests are fully offline (mock adapter pattern from `test/request-service.test.ts`;
  real-gateway integration cases are not exercised in CI). Root coverage is scoped to
  `packages/*/src/**` with global 70% thresholds (baseline: request ~85%, generate ~98%).

## Tests

- Files live in `packages/*/test/`, named `*.test.ts` or `*.spec.ts`.
- Some non-test helpers sit in `test/` too (e.g. `request-plugin.ts`, `response-interceptors.ts`)
  — they are imported by tests, not run directly.
- Vitest globals are enabled; do not add `import { describe } from 'vitest'`.
- `request/tsconfig.json` includes `../../apps/playground-test/src/**/*.ts` so the playground
  is type-checked against the package source during IDE/tsc flows.

## Conventions that differ from defaults

- **Error messages are in Chinese** (`throw new Error('请检查请求配置是否完成')`). Match this
  for user-facing strings in both packages.
- **Node built-ins use the `node:` prefix** (`import process from 'node:process'`).
- **`import type`** for type-only imports is enforced by `@antfu/eslint-config`.
- No semicolons, single quotes, 2-space indent, LF — enforced by ESLint, not Prettier.
- Files are kebab-case (`request-service.ts`, `request-adapter.interface.ts`).
- Class/interface: PascalCase. Methods/functions: camelCase. Getter utils prefixed `get*`
  (`getServiceName`, `getOperationName`).
- `RequestService` is a singleton via static `getInstance()`; preserve that invariant.

## Commits & release

- **Commit types** are custom (Chinese, Commitizen): `feat` `fix` `docs` `refactor` `perf`
  `test` `build` `revert` — defined in `.cz-config.js`. Use `pnpm commit` for the interactive prompt.
- `commit-msg` hook runs commitlint; its config (inline in `package.json`) extends
  `@commitlint/config-conventional`. The commitizen prompt types above all conform to it.
- Pre-commit hook runs `lint-staged`: ESLint `--cache --fix` on `.ts/.tsx/.js/.jsx`,
  **excluding `*.spec.*`**.
- Release flow: add a changeset (`pnpm cs`), then on push to `master` the `publish.yml` workflow
  runs `changesets/action` → `pnpm build` → `pnpm run release` (`changeset publish --provenance`).
  After publish a `sync` job triggers npmmirror sync for both packages. Only `zhuchentong`
  triggers the release job.
- `ci.yml` gates every PR and master push: lint + build + typecheck + test on **Node 24**.

## Things easy to get wrong

- The old README still describes the upstream Turborepo starter (`docs`/`web`/`ui`) — **ignore it**;
  it does not match this repo.
- `pnpm-workspace.yaml` hoists `@vue/runtime-core` and `exceljs` — needed by `apps/playground-test-vite`.
- `request-generate`'s runtime config file is `request.config.ts` at the package root (CommonJS
  `module.exports` despite the `.ts` extension — loaded via `tsx`). It maps gateway applications
  (`mall-service`, `file-service`) and writes generated code to `./generated`.
- `eslint.config.mjs` un-ignores dotfiles (`.cz-config.js`, `.lintstagedrc.js`, `.babelrc.js`,
  `.request-generate.config.js`) — keep them linted.

<!-- MANUAL: Custom project notes can be added below -->
