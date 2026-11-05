# OpenAPI 3.1 支持

`request-generate` 同时解析 OpenAPI / Swagger **v2 / v3 / v3.1**。3.1 文档(JSON Schema 2020-12)与 3.0 结构高度一致,由同一套 v3 解析器处理,差异集中在 Schema 层。

## 版本路由

版本号按首字符路由:`openapi: 3.1.x` 与 `3.0.x` 一样进入 v3 解析器,无需任何配置变化。

## 3.1 特性支持范围

| 3.1 特性 | 支持情况 | 产物效果 |
| --- | --- | --- |
| type 数组可空(`type: [string, 'null']`)| ✅ 完整支持 | `string \| null` |
| type 数组多类型(`type: [string, number]`)| ✅ 完整支持 | `string \| number` |
| type 数组数组(`['array', 'null']` + items)| ✅ 完整支持 | `User[] \| null` |
| boolean schema(`true` / `false`)| ✅ 支持 | `any` / `never` |
| `const` | ✅ 映射为枚举字面量(string / number / boolean)| `'x'` |
| `nullable + enum` 组合 | ✅ 折叠 | `'a' \| 'b' \| null` |
| 3.0 `nullable: true` | ✅ 支持(行为变更:v0.4.x 静默忽略,现追加 `\| null`)| `string \| null` |
| `prefixItems`(tuple)| ⚠️ 降级 | `any[]` |
| 顶层 `webhooks` | ⚠️ 忽略 | 不产出(不影响 paths 解析)|
| 嵌套 `$defs` 引用 | ⚠️ 降级 | `any`(避免悬空 import)|
| 枚举值含引号 | ⚠️ 与 3.0 一致 | 不做转义 |

## 行为变更说明(v0.5.0)

3.0 文档中的 `nullable: true` 此前被**静默忽略**(字段类型不含 `| null`),v0.5.0 起正确附加:

```yaml
# 3.0
User:
  type: object
  properties:
    name:
      type: string
      nullable: true   # 旧版生成 name: string;新版生成 name: string | null
```

下游若依赖旧的"非空"类型,需按新产物调整判空逻辑。

## 对生成代码的影响

- 精确的可空类型会传导到生成方法的参数与响应类型(`Promise<User[] | null>` 等)
- `prefixItems` / `$defs` 降级不会中断生成,仅该字段类型宽化为 `any[]` / `any`
- request 运行时 v0.5.0 起路径参数统一 URL 编码,生成代码无需任何调整

## 实现细节

解析层通过"Schema 归一化"统一 3.0 与 3.1:类型声明归一为数组形态,`'null'` 提取为可空标记,boolean schema 短路处理。详见仓库 `packages/request-generate/src/parse/v3/parse-schema-type.ts` 与 `src/utils/get-schema-type-info.ts`。
