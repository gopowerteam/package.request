# 简介

`@gopowerteam` 请求生态由两个包组成:

| 包 | 定位 |
| --- | --- |
| [`@gopowerteam/request`](https://www.npmjs.com/package/@gopowerteam/request) | 基于**适配器模式**的 HTTP 请求库:请求调度、插件中间件、响应拦截器、请求取消 |
| [`@gopowerteam/request-generate`](https://www.npmjs.com/package/@gopowerteam/request-generate) | **OpenAPI 代码生成工具链**:从 OpenAPI / Swagger 文档生成类型安全的 Service 与 Model 代码,运行时消费 request 包 |

两者关系:`request-generate` 生成的 Service 类直接继承 `@gopowerteam/request` 内置的代码生成基类(`GenerateRequestService` / `ObservableGenerateRequestService`),把"接口定义"与"请求执行"解耦 —— 接口变更只需重新生成,请求层逻辑(鉴权、拦截、取消)只写一份。

## request 包核心概念

### 适配器模式

```
业务代码
   │  send(options)
   ▼
RequestService(单例,全局配置)
   │  before 插件 → 适配器调度 → after/catch 插件 → 拦截器
   ▼
RequestAdapter(可插拔)
   ├── AxiosAdapter(内置,基于 axios)
   ├── FetchAdapter(内置,基于原生 fetch)
   └── 自定义(小程序 / 任意运行时)
```

`RequestService` 不直接依赖任何 HTTP 客户端 —— 所有底层调用经 `RequestAdapter` 接口转发。换运行时只需换适配器,业务代码零改动。

### 三层扩展点

1. **插件(`RequestPlugin`)** —— `before` / `after` / `catch` 三段生命周期,负责请求前改写与响应后副作用
2. **响应拦截器(`ResponseInterceptor`)** —— `status` / `success` / `error` / `exception` 四类,集中管理成功判定、数据转换与错误处理
3. **适配器(`RequestAdapter`)** —— 对接任意底层 HTTP 客户端

## generate 包工作原理

```
OpenAPI 文档(JSON / URL)
        │
        ▼
┌──────────────────────┐    解析(parseV2 / parseV3)
│  request-generate    │ ─────────────────────────►
│  (CLI / API / Vite)  │    模板渲染(Handlebars)
└──────────────────────┘
        │
        ▼
   生成产物(*.ts)
   ├── services/*Service.ts  ── 运行时依赖 ──►  @gopowerteam/request
   └── models/*.ts                                    │
                                                      ▼
                                              RequestService.send()
```

支持 OpenAPI **v2 / v3 / v3.1**(JSON Schema 2020-12),产物为 ESM/CJS 双友好的纯 TS 文件。

## 环境要求

- Node.js ≥ 24.11(本仓库工具链要求;浏览器环境无此限制)
- `@gopowerteam/request` 依赖 `axios`(自动安装),查询参数序列化为内置实现,无额外运行时依赖
- Observable 模式需要 `rxjs` >= 7(可选 peer,promise 模式无需安装)

## 下一步

- [快速上手](/guide/getting-started.md) —— 五分钟接入 request 包
- [生成代码](/generate/getting-started.md) —— 从 OpenAPI 文档生成 Service
- [查看示例](/examples/basic-crud.md) —— 完整的 CRUD 消费示例
