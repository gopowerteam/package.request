# @gopowerteam/request

## 0.3.0

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

## 0.2.1

### Patch Changes

- update tsdown config

## 0.2.0

### Minor Changes

- 升级依赖

## 0.1.21

### Patch Changes

- 更换 query-string 相关逻辑为内置函数

## 0.1.20

### Patch Changes

- update

## 0.1.19

### Patch Changes

- update mts bin

## 0.1.18

### Patch Changes

- fixed import handlebars

## 0.1.17

### Patch Changes

- add async before plugin support

## 0.1.16

### Patch Changes

- filter empty & null & undefined value

## 0.1.15

### Patch Changes

- 修改类型提示

## 0.1.14

### Patch Changes

- 添加 AppendParams 支持

## 0.1.13

### Patch Changes

- fixed generate request url

## 0.1.12

### Patch Changes

- 添加生成请求 URL 支持

## 0.1.11

### Patch Changes

- 添加 applications 支持

## 0.1.10

### Patch Changes

- 更新 axios 适配器

## 0.1.9

### Patch Changes

- 更新 axios 适配器

## 0.1.6

### Patch Changes

- 更新 RequestAdapter 接口

## 0.1.5

### Patch Changes

- 添加类型导出

## 0.1.4

### Patch Changes

- 更新类型导出

## 0.1.3

### Patch Changes

- 更新 adapter 导出

## 0.1.1

### Patch Changes

- 更新导出类型

## 0.1.0

### Minor Changes

- 支持 OpenAPIV2&V3 请求代码生成
