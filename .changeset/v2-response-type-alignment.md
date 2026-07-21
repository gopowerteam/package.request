---
'@gopowerteam/request-generate': minor
---

V2 parser 测试覆盖补全 + 响应类型推导对齐 V3 + 死代码清理。

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
