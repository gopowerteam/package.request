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

插件在 `buildStart` 阶段自动触发生成,并把所有 `*Service.ts` 聚合成虚拟模块 `virtual:request`,提供统一导入入口。

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
| `dir` | `string` | Service 文件所在目录(相对项目根)|
| `dts` | `string \| boolean` | 声明文件输出路径;`false` 不生成 |

### 使用虚拟模块

```ts
import { UserService, OrderService } from 'virtual:request'

const userService = new UserService()
```

> 前提:项目根目录存在有效的 `request.config.ts`。
