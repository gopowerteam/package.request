---
'@gopowerteam/request-generate': patch
---

vite 插件虚拟模块补齐 Service 具名导出

`virtual:request` 此前仅导出 `useRequest`,文档示例的 `import { UserService } from 'virtual:request'` 在运行时与类型层面均不可用(Missing export)。现对扁平 Service 与分组 Service(以别名导出 `Mall_OrderService as OrderService`)补齐具名导出,代码与 d.ts 同步,文档用法真实可用。
