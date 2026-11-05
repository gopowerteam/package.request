---
home: true
title: 主页
heroText: "@gopowerteam/request"
tagline: 适配器模式的 HTTP 请求库 + OpenAPI 代码生成工具链,类型安全、可扩展、跨运行时
actions:
  - text: 快速上手
    link: /guide/getting-started.md
    type: primary
  - text: 代码生成
    link: /generate/getting-started.md
    type: secondary
  - text: 查看示例
    link: /examples/basic-crud.md
    type: secondary
features:
  - title: 适配器模式
    details: RequestAdapter 接口解耦请求调度与底层 HTTP 客户端,内置 AxiosAdapter,亦可自行对接 fetch / 小程序等运行时
  - title: 插件中间件
    details: before / after / catch 三段生命周期,鉴权、loading、日志、埋点等横切逻辑即插即用,内置作用域级请求取消 AbortService
  - title: 响应类型泛型
    details: "send 方法支持响应类型泛型;配合代码生成,Service 方法自动携带响应类型,IDE 补全全程在线"
  - title: OpenAPI 代码生成
    details: 支持 OpenAPI v2 / v3 / v3.1,CLI、编程式 API 与 Vite 插件三种接入方式,自动产出类型安全的 Service 与 Model
  - title: 双响应模式
    details: responseType 可选 promise 或 observable(rxjs),生成的代码结构完全一致,切换零成本
  - title: 多应用聚合
    details: 单份 request.config.ts 驱动多个后端服务的代码生成,增量缓存感知接口与规则变更
footer: MIT Licensed | Copyright © gopowerteam
---
