# CLI 与 Vite 插件

## CLI

本包注册两个命令:

```bash
# 生成 Service / Model 代码
request-generate [--config <path>]

# 下载 OpenAPI 文档到 .request/ 目录
request-download [--config <path>]
```

### 配置文件查找顺序

未传 `--config` 时,在当前工作目录按以下顺序查找,存在即停止:

1. `request.config.ts`(推荐,tsx 加载,支持 `module.exports`)
2. `request-generate.config.cjs`
3. `request-generate.config.mjs`
4. `request-generate.config.js`

全部不存在时抛错。

## 编程式调用

无需 CLI,直接在脚本里调用(便于接入自定义构建流):

```ts
import type { GenerateOptions } from '@gopowerteam/request-generate'
import { defineConfig, download, generate } from '@gopowerteam/request-generate'

const options: GenerateOptions = defineConfig({
  gateway: 'https://api.example.com',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  applications: { 'user-service': 'user-service' },
  exportServices: { responseType: 'promise' },
})

async function main() {
  await download(options) // 先下载文档到 .request/(可选,便于离线 / 调试)
  await generate(options) // 再生成代码
}

main()
```

| 函数 | 说明 |
| --- | --- |
| `generate(options)` | 解析 OpenAPI 文档并生成 Service / Model |
| `download(options)` | 下载各应用的 OpenAPI 文档到 `.request/{name}.json` |
| `defineConfig(options)` | 配置类型守卫,返回原对象(便于 IDE 提示)|

## Vite 插件

插件在 `buildStart` 阶段自动触发生成,并把所有 `*Service.ts` 聚合成虚拟模块 `virtual:request`,提供 `useRequest` 统一取用入口(无分组布局下另有 Service 具名导出,见「使用虚拟模块」)。

### 接入

```ts
// vite.config.ts
import { fileURLToPath } from 'node:url'
import request from '@gopowerteam/request-generate/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    request({
      alias: '@',                              // 对应 resolve.alias 的别名
      dir: 'src/http',                         // Service 文件所在目录
      dts: 'src/types/generated/request.d.ts', // 声明文件输出位置;false 关闭
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
})
```

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `alias` | `string` | 必须与 `resolve.alias` 一致,用于解析 Service 路径 |
| `dir` | `string` | Service 文件所在目录(相对项目根);未指定时回退 `request.config.ts` 的 `output` |
| `dts` | `string \| boolean` | 声明文件输出路径;`false` 不生成 |
| `groupStrategy` | `'http' \| 'first-dir' \| 'none'` | Service 分组策略,缺省 `'http'`;见下方「多应用分组」 |
| `generate` | `boolean` | 缺省 `true` 在插件内进程生成;`false` 跳过生成(交给外部管线),仅扫描 + 装配 |
| `throwOnError` | `boolean` | 缺省 `true` 失败即抛出;`false` 降级为警告 + 空实现(useRequest 调用时抛运行时错误) |

### tsconfig 侧要求

生成的 `declare module "virtual:request"` 声明内部 import 走 `alias`(如 `@/http/services/UserService`),因此消费方必须**同时**配置:

- vite `resolve.alias`(运行时解析)
- tsconfig `compilerOptions.paths`(编译期解析)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

缺少 tsconfig 侧配置时,TS 无法解析声明链,`virtual:request` 的类型提示整条失效。

### 多应用分组(groupStrategy)

一个生成目录承载多个 OpenAPI 来源(`<output>/<app>/services/`)时,不同应用常存在同名 Service。缺省 `'http'` 策略只认路径中的 `http` 目录段,该布局下全部落入扁平结构,重名会直接报错。此时启用 `first-dir`:

```ts
request({
  alias: '@',
  dir: 'generated',
  groupStrategy: 'first-dir', // 以扫描目录下第一级子目录名(PascalCase 后)作为分组
})
```

```ts
import { useRequest } from 'virtual:request'

const authService = useRequest((s) => s.DsoService.AuthService)
```

分组重名/撞名(两个目录 PascalCase 后同名、组内 Service 重名、分组名与扁平 Service 名冲突)会在启动期给出明确报错,而非产出坏代码。

> **分组布局下没有 Service 具名导出**:不同应用的同名 Service 不存在全局唯一裸名,为分组 Service 生成 `export { <组>_<服务> as <服务> }` 会产出重复导出,导致 rolldown/rollup/vitest 解析失败。因此 `virtual:request` 的具名导出只来自无分组的扁平 Service;分组场景一律通过 `useRequest((s) => s.<Group>.<Service>)` 取用。若扫描根下的扁平 Service 文件名恰好等于「组名_服务名」(如 `DsoService_AuthService.ts` 与 `DsoService` 组内的 `AuthService.ts`),插件会在启动期报「局部绑定冲突」错误。

### vitest 场景

vitest 走 vite transform 管道,不执行 rollup 的 `buildStart`。插件已做惰性兜底(首次 `load` 现场扫描),但测试进程内生成仍会触发下载/写盘副作用,推荐配合关闭:

```ts
request({ alias: '@', dir: 'generated', generate: false })
```

### 快照热更新

插件会监听 `.request/` 快照文件(vite dev / rollup --watch)。用 `request-download` 刷新接口后,dev server 自动重算 `virtual:request` 并触发页面重载,无需手动重启。

### 路径解析基准

`.request` 快照/账本与 `output` 相对路径统一以**配置文件所在目录**为基准解析,不依赖 vite 进程的 `cwd`——monorepo 中 vite 进程 cwd 为子包目录时快照/产物仍落在配置文件所在位置;插件扫描目录与生成产物使用同一基准,不会分叉。

### 使用虚拟模块

无分组布局下,Service 以具名导出提供:

```ts
import { UserService, OrderService } from 'virtual:request'

const userService = new UserService()
```

> 前提:项目根目录存在有效的 `request.config.ts`,且**未启用分组**——分组布局下插件不为分组 Service 生成具名导出(避免跨应用同名导致的重复导出解析失败,见「多应用分组」),请改用 `useRequest((s) => s.<Group>.<Service>)`。
