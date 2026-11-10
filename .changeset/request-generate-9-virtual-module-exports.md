---
'@gopowerteam/request-generate': patch
---

修复 vite-plugin `virtual:request` 为分组 Service 生成顶层具名导出导致的重复导出阻断(issue #9)

**问题**:0.5.1 为所有分组 Service 生成 `export { <组>_<服务> as <服务> }`。不同应用存在同名 Service 时,虚拟模块中出现重复导出,rolldown / rollup / vitest 直接解析失败(每个重名一条 PARSE_ERROR);同样的内容写入 `.d.ts` 后,在 `skipLibCheck: true` 下 TS2300 被静默抑制,类型悄悄解析到第一个声明,与运行时分叉。

**修复**:分组布局下虚拟模块不再提供 Service 具名导出——分组 Service 的名字以应用为作用域,不存在全局唯一裸名。`useRequest((s) => s.<Group>.<Service>)` 路径完全不受影响;`.d.ts` 与运行时共用同一模板,导出面恒等。

**已知影响与迁移**:

- 生成目录为「多应用分组」布局(如 `<output>/<app>/services/` 配合 `groupStrategy: 'first-dir'`),且业务代码写了 `import { XxxService } from 'virtual:request'` 的:该写法在 0.5.1 下必然已被重复导出解析错误阻断,无法正常构建,因此本次修复不会让任何可构建的项目报错。迁移到推荐写法:

  ```ts
  // 之前(0.5.1 下构建失败,仅无重名时碰巧可用)
  import { AuthService } from 'virtual:request'
  const authService = new AuthService()

  // 之后(分组布局推荐)
  import { useRequest } from 'virtual:request'
  const authService = useRequest((s) => s.DsoService.AuthService)
  ```

- 无分组布局(单应用 / `groupStrategy: 'none'`):具名导出 `import { UserService } from 'virtual:request'` 保持不变。

另外新增启动期断言:扁平 Service 名与「组名_服务名」导入别名重名时(如扫描根存在 `DsoService_AuthService.ts` 且 `DsoService` 组内有 `AuthService.ts`),直接给出「局部绑定冲突」明确报错,不再产出不可解析的重复局部绑定。
