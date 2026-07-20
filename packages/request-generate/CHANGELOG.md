# @gopowerteam/request-generate

## 0.3.6

### Patch Changes

- 修复已知问题

## 0.3.5

### Patch Changes

- 修复已知问题

## 0.4.0

### Minor Changes

- ✨ V3 RequestBody 与 Response 支持 `multipart/form-data`、`application/octet-stream`、`application/pdf`、`text/csv` 等多 media 类型,自动映射为 `FormData` / `Blob` / `URLSearchParams` / `string`
- ✨ V3 RequestBody/Response 识别 JSON 家族(`application/json; charset=utf-8`、`application/problem+json`、`application/vnd.*+json`),不再漏匹配
- ✨ 错误信息含 path/method/operationId 上下文,便于定位失败的 operation
- ✨ V3 PathItemObject 的非方法字段(`parameters`/`summary`/`description`/`servers`)不再被误识别为 operation
- ✨ 目录删除安全守卫:输出目录需含 `.generated` 标记文件才会被清空,防止误删用户已存在的同名目录
- ✨ CLI 支持 `.cjs`/`.mjs` 配置文件(原仅识别 `.js`/`.ts`)

### Patch Changes

- 🛠 V3 `parseOperation` 修复 `responses` → `response` 拼写错误(原导致 response `$ref` 时抛错)
- 🛠 V3 `components.schemas` 缺失时不再崩溃
- 🛠 V3 `schema.items` 缺失时不再抛 cryptic TypeError
- 🛠 schema 解析错误信息包含 schema 内容片段(JSON 截断 200 字符)
- 🛠 `getApiDocument` 改为 throw(原 `process.exit(0)` 误报成功,误导 CI/CD)
- 🛠 `generateClient` switch 增加默认分支,未知版本不再静默返回 undefined
- 🛠 Download 模块校验 `response.ok`,HTTP 错误状态不再被 `.json()` 吞掉
- 🛠 `getOpenApiDocument` 校验空输入
- 🛠 Vite 插件 alias 未配置时给出明确错误(原 `as any` 导致 cryptic TypeError)
- 🛠 MD5 改为基于 Buffer(原 `.toString()` 对非 UTF-8 内容会失真)
- 🛠 `writeServices` 不再修改原始 service entity(改为浅克隆写入)
- 🛠 修复 `OpenAPIV3.ContentObject` 类型引用错误(openapi-types 未导出此类型)
- 🛠 移除损坏的 `bin/index.mts`(调用不存在的 default 导出,且未在 package.json bin 中注册)
- 🛠 tsconfig 修正 include:增加 `test/**/*.test.ts`,移除不存在的 `src/types/global.d.ts`
- 🛠 `vite-plugin.d.ts` 路径补 `.mts` 后缀(原 `index.d` 不存在)
- 🛠 包级 `vitest.config.ts`(修复 `pnpm --filter ... test` 找不到测试文件的问题)
- 🧪 删除依赖内网网关的 `generate.spec.ts`,新增 fixture-based 单元测试覆盖 parser/write/download

## 0.3.4

### Patch Changes

- update display result

## 0.3.3

### Patch Changes

- update to esm

## 0.3.2

### Patch Changes

- fixed tsdown copy config

## 0.3.1

### Patch Changes

- remove rimraf package

## 0.3.0

### Minor Changes

- 升级依赖

## 0.2.3

### Patch Changes

- 添加 dts 生成开启选项

## 0.2.2

### Patch Changes

- update

## 0.2.1

### Patch Changes

- auto generate when not found output dir

## 0.2.0

### Minor Changes

- 更新生成接口方式

## 0.1.26

### Patch Changes

- fixed schema type compute

## 0.1.25

### Patch Changes

- update progress display

## 0.1.24

### Patch Changes

- update bin

## 0.1.23

### Patch Changes

- update mts bin

## 0.1.22

### Patch Changes

- update

## 0.1.21

### Patch Changes

- fixed import handlebars

## 0.1.20

### Patch Changes

- update defineConfig

## 0.1.19

### Patch Changes

- ed08fd3: add appendService options
- add append-service option

## 0.1.18

### Patch Changes

- fixed came-name convert

## 0.1.17

### Patch Changes

- update package.json

## 0.1.16

### Patch Changes

- 添加多请求获取

## 0.1.15

### Patch Changes

- fixed split params

## 0.1.14

### Patch Changes

- add built-in type

## 0.1.13

### Patch Changes

- fixed template

## 0.1.12

### Patch Changes

- 添加生成请求 URL 支持

## 0.1.11

### Patch Changes

- 更新 model name 生成

## 0.1.10

### Patch Changes

- 补充 ref:object 类型支持

## 0.1.9

### Patch Changes

- 添加 applications 支持

## 0.1.8

### Patch Changes

- 更新 reponse media 类型支持

## 0.1.7

### Patch Changes

- 修复 paramters path 模板

## 0.1.6

### Patch Changes

- 修复 openapi v2 类型 parse

## 0.1.4

### Patch Changes

- 添加类型导出

## 0.1.3

### Patch Changes

- 更新类型导出

## 0.1.2

### Patch Changes

- 更新导出类型

## 0.1.0

### Minor Changes

- 支持 OpenAPIV2&V3 请求代码生成
