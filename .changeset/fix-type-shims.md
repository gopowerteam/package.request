---
'@gopowerteam/request': patch
---

修复 adapters.d.ts 兼容 shim（原路径无法被 TypeScript 解析），并新增 plugins.d.ts 补齐 ./plugins 出口的 node10 解析支持
