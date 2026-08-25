# AbortSignal / AbortService 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `@gopowerteam/request` 添加 signal/abort 手动终止请求能力：核心层 signal 透传 + `AdapterResponse.canceled` 契约 + AxiosAdapter 取消识别 + 内置插件 `AbortService`（`src/plugins/` 子路径导出）。

**Architecture:** 两层设计。第 1 层传输通道：`RequestSendOptions.signal` → `RequestService.startRequest` 透传 → `RequestAdapterOptions.signal` → 各 adapter 消费；取消识别下沉到 adapter 的 `transformException`（axios 用 `axios.isCancel()`），统一打 `canceled: true` 标记后走现有异常流程（catch 插件 → exception/error 拦截器静默）。第 2 层门面：`AbortService` 实现 `RequestPlugin`，经 `before` 钩子注入 signal（作用域式：每实例管理多个 controller，`abort()` 终止该实例全部 in-flight 请求），配合生成代码已有的 `requestPlugins` 参数，零 codegen 改动。

**Tech Stack:** TypeScript 5.9（`types` 加 `node` 解析 `AbortSignal` 全局类型）、axios 1.13.5 原生 signal、Vitest 3（globals 模式）、tsdown。

**已确认的设计决策（含验证结论）：**

- 取消走现有异常流程，拦截器经 `response.canceled` 静默处理（用户确认）
- 仅改 request 包，request-generate 模板不动（用户确认）
- AbortService 作用域式语义、类名 `AbortService`、内置导出显式传入（用户确认）
- **不新增** `src/utils/abort.ts` / `onAbort` 工具（用户确认移除，YAGNI）
- 可行性已实证（Node 24 + axios 1.13.5）：
  - axios 预 aborted signal 离线抛 `CanceledError`（`code: ERR_CANCELED`，无网络依赖），E2E 可离线跑
  - `@types/node@24.10.15` 经 `web-globals/abortcontroller.d.ts` 全局声明 `AbortController/AbortSignal`
  - 现有 axios mock 缺 `isCancel`，`transformException` 改动必须同步修复 mock
  - 微任务时序：`send()` 返回 pending 的同步阶段 controller 已注册，调用方立即 `abort()` 无竞态窗口
  - 完整流程复刻：exception 与 error 拦截器均收到 `canceled: true`，catch 插件自动回收
  - observable 模式（`from(promise)`）取消 rejection 正常传播到 error 回调
- 代码风格：无分号、单引号、`import type`、中文注释/错误信息、私有方法无下划线前缀、未用参数 `_` 前缀（`noUnusedParameters`）

**文件结构总览：**

| 文件 | 操作 | 职责 |
|---|---|---|
| `packages/request/src/interfaces/request-send.interface.ts` | 修改 | `signal?: AbortSignal` |
| `packages/request/src/interfaces/request-adapter.interface.ts` | 修改 | `RequestAdapterOptions.signal`、`AdapterResponse.canceled` |
| `packages/request/src/request-service.ts` | 修改 | `startRequest` 透传 signal |
| `packages/request/src/adapters/axios.adapter.ts` | 修改 | signal 进 axios config；`isCancel` 识别 |
| `packages/request/src/plugins/abort-service.ts` | 新建 | AbortService 插件 |
| `packages/request/src/plugins/index.ts` | 新建 | plugins barrel |
| `packages/request/tsconfig.json` | 修改 | `types` 加 `"node"` |
| `packages/request/tsdown.config.ts` | 修改 | entry 加 plugins |
| `packages/request/package.json` | 修改 | `exports` 加 `./plugins` |
| `packages/request/test/abort-signal.test.ts` | 新建 | 全部新测试（渐进式追加） |
| `packages/request/test/axios-adapter.test.ts` | 修改 | mock 补 `isCancel` |
| `packages/request/README.md` | 修改 | 用法文档 |

---

### Task 1: 类型契约 + 核心透传

**Files:**

- Modify: `packages/request/src/interfaces/request-send.interface.ts:14-22`
- Modify: `packages/request/src/interfaces/request-adapter.interface.ts:29-44`
- Modify: `packages/request/src/request-service.ts:130-148`
- Modify: `packages/request/tsconfig.json:9`
- Test: `packages/request/test/abort-signal.test.ts`（新建）

- [ ] **Step 1: 写失败的透传测试**

新建 `packages/request/test/abort-signal.test.ts`：

```ts
import type { RequestAdapterOptions } from '../src/interfaces/request-adapter.interface'
import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'

// 可捕获 adapter 选项的 Mock 适配器
class MockAdapter {
  public lastOptions: RequestAdapterOptions | undefined

  public async request(options: RequestAdapterOptions) {
    this.lastOptions = options
    return { data: {}, status: 200, statusText: 'OK', headers: {} }
  }

  public transformResponse(response: any) {
    return response
  }

  public transformException(exception: any) {
    return { data: {}, status: 400, statusText: '', headers: {} }
  }
}

function createMockSetup() {
  const adapter = new MockAdapter()
  const config: RequestSetupConfig = {
    gateway: 'http://127.0.0.1:9',
    adapter: adapter as any,
    interceptors: {
      status: { exec: () => true },
      success: { exec: r => r },
      error: { exec: r => r },
      exception: { exec: r => r },
    },
    plugins: [],
  }
  setup(config)
  return adapter
}

describe('signal 透传', () => {
  it('send() 应将 signal 透传给 adapter.request', async () => {
    const adapter = createMockSetup()
    const controller = new AbortController()

    await RequestService.getInstance().send({
      path: '/test',
      method: 'GET',
      signal: controller.signal,
    })

    expect(adapter.lastOptions?.signal).toBe(controller.signal)
  })

  it('未传 signal 时 adapter 收到 undefined', async () => {
    const adapter = createMockSetup()

    await RequestService.getInstance().send({
      path: '/test',
      method: 'GET',
    })

    expect(adapter.lastOptions?.signal).toBeUndefined()
  })
})
```

- [ ] **Step 2: 运行验证失败**

Run: `pnpm vitest run packages/request/test/abort-signal.test.ts`
Expected: FAIL —— 第一条用例 `signal` 为 `undefined`

- [ ] **Step 3: 实现类型与透传**

`request-send.interface.ts`（接口末尾加字段）：

```ts
export interface RequestSendOptions {
  service?: string
  path: string
  method: RequestMethod | string
  headers?: Record<string, string | boolean>
  paramsPath?: Record<string, string | number>
  paramsQuery?: Record<string, any>
  paramsBody?: any
  signal?: AbortSignal
}
```

`request-adapter.interface.ts`（两处）：

```ts
export interface RequestAdapterOptions {
  baseURL: string
  pathURL: string
  headers: Record<string, string | boolean>
  method: RequestMethod | string
  paramsQuery?: Record<string, any>
  paramsBody?: any
  extraParams?: any
  signal?: AbortSignal
}

export interface AdapterResponse {
  data: Record<string, any>
  status: number
  statusText: string
  headers: AdapterResponseHeaders
  canceled?: boolean
}
```

`request-service.ts` 的 `startRequest`（`extraParams,` 之后加一行）：

```ts
      paramsBody: options.paramsBody,
      extraParams,
      signal: options.signal,
```

`tsconfig.json` 第 9 行：

```json
  "types": ["vitest/globals", "node"],
```

- [ ] **Step 4: 运行验证通过**

Run: `pnpm vitest run packages/request/test/abort-signal.test.ts`
Expected: PASS（2 个用例）

- [ ] **Step 5: 提交**

```bash
git add packages/request/src/interfaces/request-send.interface.ts packages/request/src/interfaces/request-adapter.interface.ts packages/request/src/request-service.ts packages/request/tsconfig.json packages/request/test/abort-signal.test.ts
git commit -m "feat: 请求选项与适配器契约新增 signal 字段并透传"
```

---

### Task 2: AxiosAdapter 消费 signal

**Files:**

- Modify: `packages/request/src/adapters/axios.adapter.ts:64-84`
- Test: `packages/request/test/axios-adapter.test.ts`（追加用例）

- [ ] **Step 1: 写失败的测试**

在 `axios-adapter.test.ts` 追加（复用文件既有的 `setupAdapter` / `lastRequestCall` 辅助，名字以文件实际为准）：

```ts
  it('应将 signal 传入 axios 请求配置', async () => {
    const adapter = setupAdapter()
    const controller = new AbortController()

    await adapter.request({
      baseURL: '',
      pathURL: '/users',
      method: 'GET',
      headers: {},
      signal: controller.signal,
    })

    expect(lastRequestCall().signal).toBe(controller.signal)
  })
```

- [ ] **Step 2: 运行验证失败**

Run: `pnpm vitest run packages/request/test/axios-adapter.test.ts`
Expected: FAIL —— `signal` 为 `undefined`

- [ ] **Step 3: 实现**

`axios.adapter.ts` 的 `request` 方法：

```ts
  public request({
    baseURL,
    pathURL,
    headers,
    method,
    paramsQuery,
    paramsBody,
    extraParams = {},
    signal,
  }: RequestAdapterOptions) {
    const axiosInstance = this.getAxiosInstance()

    return axiosInstance.request({
      method,
      baseURL,
      headers: this.applyContentTypeHeader(headers, paramsBody),
      params: paramsQuery,
      data: paramsBody,
      url: pathURL,
      signal,
      ...extraParams,
    })
  }
```

注意 `signal` 放在 `...extraParams` 之前（extraParams 保留最高优先级）。

- [ ] **Step 4: 运行验证通过**

Run: `pnpm vitest run packages/request/test/axios-adapter.test.ts`
Expected: PASS（全部）

- [ ] **Step 5: 提交**

```bash
git add packages/request/src/adapters/axios.adapter.ts packages/request/test/axios-adapter.test.ts
git commit -m "feat: AxiosAdapter 支持 signal 取消请求"
```

---

### Task 3: transformException 取消识别（含现有 mock 修复）

**Files:**

- Modify: `packages/request/src/adapters/axios.adapter.ts:134-141`
- Modify: `packages/request/test/axios-adapter.test.ts:6-12`（mock 补 `isCancel`）

- [ ] **Step 1: 写失败的测试**

`axios-adapter.test.ts` 追加（`transformException` 相关 describe 内）：

```ts
  it('取消异常应返回 canceled: true 的响应', () => {
    const cancelError = Object.assign(new Error('canceled'), {
      __CANCEL__: true,
      code: 'ERR_CANCELED',
      name: 'CanceledError',
    })

    const result = adapter.transformException(cancelError)

    expect(result.canceled).toBe(true)
    expect(result.status).toBe(400)
  })

  it('非取消异常不应标记 canceled', () => {
    const normalError = Object.assign(new Error('network error'), {
      response: { data: { msg: 'err' }, status: 500, statusText: 'Server Error', headers: {} },
    })

    const result = adapter.transformException(normalError)

    expect(result.canceled).toBeFalsy()
    expect(result.status).toBe(500)
  })
```

- [ ] **Step 2: 运行验证失败**

Run: `pnpm vitest run packages/request/test/axios-adapter.test.ts -t "取消异常"`
Expected: FAIL —— `canceled` 为 `undefined`

- [ ] **Step 3: 实现 + 同步修复 mock（必须同一步）**

`axios.adapter.ts` 的 `transformException`：

```ts
  public transformException(exception: AxiosError): AdapterResponse {
    return {
      data: exception.response?.data || {},
      statusText: exception.response?.statusText || '',
      status: exception.response?.status || 400,
      headers: (exception.response?.headers as AdapterResponseHeaders) || {},
      canceled: axios.isCancel(exception),
    }
  }
```

`axios-adapter.test.ts` 顶部 mock 补 `isCancel`（真实 axios 判定 `__CANCEL__ === true`，mock 对齐）：

```ts
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
    })),
    isCancel: (value: any) => !!value?.__CANCEL__,
  },
}))
```

- [ ] **Step 4: 运行验证通过（确认未破坏既有用例）**

Run: `pnpm vitest run packages/request/test/axios-adapter.test.ts`
Expected: PASS（全部，含既有 `transformException` 用例）

- [ ] **Step 5: 提交**

```bash
git add packages/request/src/adapters/axios.adapter.ts packages/request/test/axios-adapter.test.ts
git commit -m "feat: 取消异常在 AdapterResponse 上标记 canceled"
```

---

### Task 4: AbortService 插件

**Files:**

- Create: `packages/request/src/plugins/abort-service.ts`
- Test: `packages/request/test/abort-signal.test.ts`（追加）

- [ ] **Step 1: 写失败的测试**

`abort-signal.test.ts` 追加：

```ts
import { AbortService } from '../src/plugins/abort-service'

describe('AbortService 作用域插件', () => {
  it('before() 应为请求注入 signal', async () => {
    const abortService = new AbortService()
    const options: any = { path: '/x', method: 'GET' }

    await abortService.before(options, () => {})

    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(abortService.size).toBe(1)
  })

  it('after() 应回收已完成请求的 controller', async () => {
    const abortService = new AbortService()
    const options: any = {}
    await abortService.before(options, () => {})

    abortService.after({} as any, options)

    expect(abortService.size).toBe(0)
  })

  it('catch() 应回收失败请求的 controller', async () => {
    const abortService = new AbortService()
    const options: any = {}
    await abortService.before(options, () => {})

    abortService.catch({} as any, options)

    expect(abortService.size).toBe(0)
  })

  it('abort() 应终止所有 in-flight 请求并清空', async () => {
    const abortService = new AbortService()
    const optionsA: any = {}
    const optionsB: any = {}
    await abortService.before(optionsA, () => {})
    await abortService.before(optionsB, () => {})

    abortService.abort()

    expect(optionsA.signal.aborted).toBe(true)
    expect(optionsB.signal.aborted).toBe(true)
    expect(abortService.size).toBe(0)
  })

  it('已回收的请求不受后续 abort() 影响', async () => {
    const abortService = new AbortService()
    const finished: any = {}
    const inflight: any = {}
    await abortService.before(finished, () => {})
    await abortService.before(inflight, () => {})
    abortService.after({} as any, finished)

    abortService.abort()

    expect(finished.signal.aborted).toBe(false)
    expect(inflight.signal.aborted).toBe(true)
  })

  it('连续请求生成独立 controller 互不影响', async () => {
    const abortService = new AbortService()
    const first: any = {}
    const second: any = {}
    await abortService.before(first, () => {})
    await abortService.before(second, () => {})

    abortService.abort()

    expect(first.signal).not.toBe(second.signal)
  })
})
```

- [ ] **Step 2: 运行验证失败**

Run: `pnpm vitest run packages/request/test/abort-signal.test.ts`
Expected: FAIL —— 模块 `../src/plugins/abort-service` 不存在

- [ ] **Step 3: 实现**

新建 `packages/request/src/plugins/abort-service.ts`：

```ts
import type { AdapterResponse } from '../interfaces/request-adapter.interface'
import type { RequestPlugin } from '../interfaces/request-plugin.interface'
import type { RequestSendOptions } from '../interfaces/request-send.interface'

/**
 * 请求终止插件
 * 每个实例为一个取消作用域,abort() 会终止该实例发起的所有进行中请求
 */
export class AbortService implements RequestPlugin {
  private controllers = new Set<AbortController>()

  /**
   * 获取进行中的请求数量
   */
  public get size(): number {
    return this.controllers.size
  }

  /**
   * 为请求注入 signal
   */
  public async before(options: RequestSendOptions): Promise<void> {
    const controller = new AbortController()
    this.controllers.add(controller)
    options.signal = controller.signal
  }

  /**
   * 回收已完成请求的 controller
   */
  public after(_response: AdapterResponse, options: RequestSendOptions): void {
    this.dispose(options.signal)
  }

  /**
   * 回收失败请求的 controller
   */
  public catch(_response: AdapterResponse, options: RequestSendOptions): void {
    this.dispose(options.signal)
  }

  /**
   * 终止所有进行中的请求
   */
  public abort(): void {
    this.controllers.forEach(controller => controller.abort())
    this.controllers.clear()
  }

  /**
   * 按 signal 回收对应 controller
   */
  private dispose(signal?: AbortSignal): void {
    if (!signal) {
      return
    }

    for (const controller of this.controllers) {
      if (controller.signal === signal) {
        this.controllers.delete(controller)
        break
      }
    }
  }
}
```

- [ ] **Step 4: 运行验证通过**

Run: `pnpm vitest run packages/request/test/abort-signal.test.ts`
Expected: PASS（Task 1 + Task 4 全部用例）

- [ ] **Step 5: 提交**

```bash
git add packages/request/src/plugins/abort-service.ts packages/request/test/abort-signal.test.ts
git commit -m "feat: 新增内置插件 AbortService 提供作用域级请求终止"
```

---

### Task 5: plugins 子路径导出

**Files:**

- Create: `packages/request/src/plugins/index.ts`
- Modify: `packages/request/tsdown.config.ts:4`
- Modify: `packages/request/package.json:15-26`

- [ ] **Step 1: barrel 文件**

新建 `packages/request/src/plugins/index.ts`：

```ts
export * from './abort-service'
```

- [ ] **Step 2: tsdown entry**

`tsdown.config.ts`：

```ts
  entry: ['src/index.ts', 'src/adapters/index.ts', 'src/plugins/index.ts'],
```

- [ ] **Step 3: package.json exports（对称 adapters 模式）**

在 `exports` 的 `"./adapters"` 之后追加：

```json
    "./plugins": {
      "types": "./dist/plugins/index.d.mts",
      "import": "./dist/plugins/index.mjs",
      "require": "./dist/plugins/index.cjs"
    },
```

- [ ] **Step 4: 构建验证**

Run: `pnpm --filter @gopowerteam/request build`
Expected: 构建成功，产出 `dist/plugins/index.mjs`、`dist/plugins/index.cjs`、`dist/plugins/index.d.mts`；dts 无 `AbortSignal` 类型错误

```bash
ls packages/request/dist/plugins/
```

Expected: `index.cjs  index.d.mts  index.mjs`

- [ ] **Step 5: 提交**

```bash
git add packages/request/src/plugins/index.ts packages/request/tsdown.config.ts packages/request/package.json
git commit -m "build: 新增 plugins 子路径导出"
```

---

### Task 6: 离线 E2E —— 完整 send() 流程取消语义

**Files:**

- Test: `packages/request/test/abort-signal.test.ts`（追加）

- [ ] **Step 1: 写测试（预 aborted signal 离线触发 CanceledError，已实证无网络依赖）**

`abort-signal.test.ts` 追加：

```ts
import { AxiosAdapter } from '../src/adapters'

describe('取消请求端到端(离线)', () => {
  it('预终止 signal 应走异常流程并携带 canceled 标记', async () => {
    const exceptionResponses: any[] = []
    const config: RequestSetupConfig = {
      gateway: 'http://127.0.0.1:9',
      adapter: new AxiosAdapter(),
      interceptors: {
        status: { exec: () => true },
        success: { exec: r => r },
        error: { exec: r => r },
        exception: { exec: (r) => {
          exceptionResponses.push(r)
          return r
        } },
      },
      plugins: [],
    }
    setup(config)

    const controller = new AbortController()
    controller.abort()

    const rejection = await RequestService.getInstance()
      .send({ path: '/offline', method: 'GET', signal: controller.signal })
      .then(() => null)
      .catch(r => r)

    expect(rejection).not.toBeNull()
    expect(exceptionResponses[0]?.canceled).toBe(true)
  })

  it('AbortService 注入的请求 abort 后应携带 canceled 标记', async () => {
    const exceptionResponses: any[] = []
    const config: RequestSetupConfig = {
      gateway: 'http://127.0.0.1:9',
      adapter: new AxiosAdapter(),
      interceptors: {
        status: { exec: () => true },
        success: { exec: r => r },
        error: { exec: r => r },
        exception: { exec: (r) => {
          exceptionResponses.push(r)
          return r
        } },
      },
      plugins: [],
    }
    setup(config)

    const abortService = new AbortService()
    const promise = RequestService.getInstance()
      .send({ path: '/offline', method: 'GET' }, [abortService])
      .then(() => null)
      .catch(r => r)

    abortService.abort()

    const rejection = await promise

    expect(rejection).not.toBeNull()
    expect(exceptionResponses[0]?.canceled).toBe(true)
    expect(abortService.size).toBe(0)
  })
})
```

- [ ] **Step 2: 运行验证通过**

Run: `pnpm vitest run packages/request/test/abort-signal.test.ts`
Expected: PASS（全部；若第二条因事件时序 flaky，在 `abortService.abort()` 前加 `await new Promise(r => setTimeout(r, 0))`）

- [ ] **Step 3: 提交**

```bash
git add packages/request/test/abort-signal.test.ts
git commit -m "test: 补充取消场景离线端到端测试"
```

---

### Task 7: README 文档

**Files:**

- Modify: `packages/request/README.md`

- [ ] **Step 1: 追加文档章节**

在 README 适当位置（插件章节之后）追加「请求取消」章节：手动 signal 用法、拦截器 `canceled` 静默处理、`AbortService`（`@gopowerteam/request/plugins`）作用域用法与防抖示例、`toURL` 注意事项、自定义 adapter（微信小程序 `RequestTask.abort()`）桥接完整示例（含 `aborted` 预检、`once: true` 解绑）、运行时前提说明（浏览器 / Node 18+ / 较新微信基础库；不使用 signal 的自定义 adapter 零影响）。多服务取用采用 `useRequest(select1, select2)` 元组写法。

- [ ] **Step 2: 提交**

```bash
git add packages/request/README.md
git commit -m "docs: README 补充 signal 与 AbortService 用法"
```

---

### Task 8: 全量验证

- [ ] **Step 1: 包级全量测试**

Run: `pnpm --filter @gopowerteam/request test`
Expected: 全部 PASS（含既有 `request-service.test.ts` 真实网关用例）

- [ ] **Step 2: 根级测试**

Run: `pnpm test`
Expected: 全部 PASS

- [ ] **Step 3: 构建 + lint**

Run: `pnpm --filter @gopowerteam/request build && pnpm --filter @gopowerteam/request lint`
Expected: 构建成功、lint 无错误

- [ ] **Step 4: 发布准备（可选）**

Run: `pnpm cs` 添加 changeset（minor：`@gopowerteam/request`）

---

## 验证结论备忘（两轮可行性实证）

| # | 验证项 | 结果 |
|---|---|---|
| 1 | 引用链透传（before 写入 options.signal → startRequest 可见） | PASS |
| 2 | axios 预 aborted signal → 离线 CanceledError（ERR_CANCELED） | PASS |
| 3 | AbortService 作用域语义（abort in-flight / 回收 / 隔离） | PASS |
| 4 | 微任务时序：send() 同步阶段 controller 已注册，立即 abort 无竞态 | PASS |
| 5 | 完整流程复刻：exception+error 拦截器均收到 canceled，catch 回收 | PASS |
| 6 | observable 模式取消传播 | PASS |
| 7 | `@types/node` 全局 AbortSignal 类型（web-globals） | PASS |
| 8 | 现有 axios mock 缺 isCancel（Task 3 必须同步修复） | 已知风险 |
