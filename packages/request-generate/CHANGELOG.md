# @gopowerteam/request-generate

## 0.4.4

### Patch Changes

- 修复已知问题

## 0.4.3

### Patch Changes

- 修复 forceClear

## 0.4.2

### Patch Changes

- 添加 forceClear 标记

## 0.4.1

### Patch Changes

- 升级依赖

## 0.4.0

### Minor Changes

- e0dcec5: 支持 multipart/binary/urlencoded/text 等 media 类型的 Content-Type 自动注入。

  ## @gopowerteam/request

  - AxiosAdapter 新增按运行时 body 类型推断 Content-Type 的逻辑
    - FormData / URLSearchParams → 设置 `Content-Type: false`,让浏览器/axios 自动补 boundary 与 charset
    - Blob → 兜底 `application/octet-stream`(B 端注入精确类型时不介入)
    - 调用方显式设置 Content-Type 时绝对优先(大小写不敏感守卫)
    - 其他类型(对象/数组/字符串/undefined)不写头,沿用 axios 实例默认的 `application/json`
  - 新增 `src/utils/content-type.ts` 工具模块
  - `RequestSendOptions.headers` / `RequestAdapterOptions.headers` 类型扩展为 `Record<string, string | boolean>`,以承载 axios `false` 哨兵语义(向后兼容)

  ## @gopowerteam/request-generate

  - V3 parser 在选中"已知非 JSON media"时把 media-type 字符串透传到 `OperationParameter.mediaType`
  - 模板 `export-service-operation.hbs` 对非 JSON 且非 multipart 的 body 自动注入 `headers: { 'Content-Type': '<media>' }`
  - multipart/form-data 显式跳过静态头注入(boundary 必须由运行时计算)
  - 新增 `is-json-media` / `is-multipart` 两个 Handlebars helper
  - JSON 家族 / `$ref` body / 未知 media → 不注入 headers,走 axios 实例默认的 application/json

- 完善整体逻辑性
- ea489d3: V2 parser 全面对齐 V3 实现,补齐 media-type 与组合类型支持。

  ## V2 parse-schema-type - 组合类型支持(原 P0)

  - 补齐 allOf/anyOf/oneOf 分支(与 V3 实现对齐),原本直接抛 "无法解析相应的 schema" 错误
  - 新分支位置在 object 兜底之前,避免 `{ type: 'object', allOf: [...] }` 静默丢失 allOf

  ## V2 media-type 支持(原 P1)

  - Phase 1.1:将 `media-type.ts` 提取到共享位置 `src/utils/get-media-type.ts`,V2 与 V3 共用 `classifyMediaType` 与 `MEDIA_TYPE_TS_MAPPING`
  - Phase 1.2:V2 `parseParametersBody` 支持 consumes 参数
    - 非\_JSON consumes(multipart/binary/urlencoded/text)→ 整体类型映射 + mediaType 注入
    - JSON 家族 consumes → 走 schema 派生,不写 mediaType(走 axios 实例默认)
    - 多 consumes 共存时 JSON 优先(与 V3 行为一致)
    - `operation.consumes` 优先于 `document.consumes`
  - Phase 1.3:V2 formData 参数聚合
    - formData 参数 + `multipart/form-data` consumes → 聚合为单一 FormData body
    - formData 参数 + 无 consumes / 非 multipart consumes → 静默丢弃(向后兼容)

  ## 行为契约

  | V2 输入                               | 旧行为                 | 新行为                                  |
  | ------------------------------------- | ---------------------- | --------------------------------------- |
  | allOf/anyOf/oneOf schema              | 抛错                   | 按 V3 规则解析为 `any` 或 `\|` 联合类型 |
  | body + `['application/pdf']` consumes | schema 派生(如 string) | Blob + mediaType                        |
  | body + JSON 家族 consumes             | schema 派生            | 不变(JSON 守卫)                         |
  | formData + multipart consumes         | formData 被丢弃        | 聚合为 FormData body                    |
  | formData + 无 consumes                | 丢弃                   | 静默丢弃(决策一致)                      |

- 7f6b006: V2 parser 测试覆盖补全 + 响应类型推导对齐 V3 + 死代码清理。

  ## 响应类型推导对齐 V3(P3 核心)

  - 修复 V2 `parse-operation.ts:45` 的 responseRef 兜底链:
    - 旧:`responseSchema?.ref || 'void'`(inline schema 响应全部丢类型 → 错误的 `Promise<void>`)
    - 新:`responseSchema?.ref || responseSchema?.type || 'void'`(与 V3 对齐)
  - 影响:inline schema 响应(string/integer/boolean/object/array of primitives 等)现在正确派生为对应类型
  - `$ref` 响应、parseResponseType void 兜底路径均无变化

  ## V2 测试覆盖补全(P2)

  新增 5 个测试文件共 ~44 用例:

  - `parse-parameters-path.test.ts`(6 用例)
  - `parse-parameters-query.test.ts`(13 用例,含 excludeQueryParams 与点号名转义)
  - `parse-field.test.ts`(8 用例,含 $ref/enum/array)
  - `parse-model.test.ts`(7 用例,含自引用过滤关键不变量)
  - `parse-response.test.ts`(13 用例,对齐 V3 的 parse-response.test.ts)

  V2 测试总数:36 → ~80,基本对齐 V3 的 ~60 用例(部分场景因 V2 简单不需要)。

  ## 死代码清理

  - `parse-parameters-query.ts`:删除 line 40-51 的历史实验代码注释块(零行为影响)
  - `parse-schema-type.ts`:删除 object 兜底分支(P0 引入 allOf 分支后已不可达,数学证明 + 回归测试保护)

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
