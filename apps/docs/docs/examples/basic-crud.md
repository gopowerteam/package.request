# 示例:CRUD 全流程

本示例演示完整链路:配置生成 → 全局 setup → 消费生成的 Service 完成增删改查。素材取自 `apps/playground-test`。

## 1. 生成配置(request.config.ts)

```ts
import { defineConfig } from '@gopowerteam/request-generate'

export default defineConfig({
  gateway: 'https://gateway.example.com',
  openapi: '/v3/api-docs',
  output: './src/generated/http',
  exportModels: true,
  logger: true,
  applications: {
    // 别名 → 实际应用 key;多应用可继续追加
    'dso-service': {
      key: 'dso-org-service',
      openapi: '/v3/api-docs',
    },
  },
  exportServices: {
    responseType: 'promise',
    // 后端统一的分页参数,全局剔除
    excludeQueryParams: [
      'pageNumber', 'pageSize', 'page', 'size',
      'paged', 'unpaged', 'order', 'sort', 'offset',
    ],
  },
})
```

运行 `request-generate`,产出 `services/` 与 `models/`。

## 2. 全局 setup(main.ts)

```ts
import { setup } from '@gopowerteam/request'
import type { RequestSetupConfig } from '@gopowerteam/request'
import { AxiosAdapter } from '@gopowerteam/request/adapters'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from './response-interceptors'

const config: RequestSetupConfig = {
  gateway: 'https://gateway.example.com',
  adapter: new AxiosAdapter(),
  timeout: 3000,
  interceptors: {
    status: new StatusInterceptors(),
    success: new SuccessInterceptors(),
    error: new ErrorInterceptors(),
    exception: new ExceptionInterceptors(),
  },
  plugins: [],
}

setup(config)
```

拦截器实现(集中管理信封剥离与错误结构):

```ts
import type { AdapterResponse, ResponseInterceptor } from '@gopowerteam/request'

export class StatusInterceptors implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return res.status >= 200 && res.status < 300 && res.data?.code === 0
  }
}

export class SuccessInterceptors implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return res.data?.data // 剥离信封,只返回业务数据
  }
}

export class ErrorInterceptors implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    return { code: res.data?.code, message: res.data?.message ?? '请求失败' }
  }
}

export class ExceptionInterceptors implements ResponseInterceptor {
  exec(res: AdapterResponse) {
    console.error('[request exception]', res)
  }
}
```

## 3. 增删改查消费

生成的方法自动携带路径参数、查询参数与响应类型(如 `Promise<User>`),配合 IDE 补全直接调用:

```ts
import { UserService } from '@/generated/http/services/UserService'
import type { User } from '@/generated/http/models/User'

const userService = new UserService()

// 查询列表(分页参数走 body/query,由后端契约决定)
export async function listUsers(page: number, size: number): Promise<User[]> {
  return userService.queryUser({ page, size })
}

// 详情
export async function getUser(id: number): Promise<User> {
  return userService.getUser({ id })
}

// 创建
export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  return userService.createUser(payload)
}

// 更新
export async function updateUser(id: number, payload: Partial<User>): Promise<User> {
  return userService.updateUser({ id, ...payload })
}

// 删除
export async function deleteUser(id: number): Promise<void> {
  return userService.deleteUser({ id })
}
```

组件中配合取消作用域(见[请求取消示例](/examples/cancel-request.md)):

```ts
const requestAbort = new AbortService()

// 每个生成方法的第二个参数是 requestPlugins
userService.queryUser({ page: 1 }, [requestAbort])

onBeforeUnmount(() => requestAbort.abort())
```

## 要点回顾

- **业务层只写一次 setup**:鉴权、错误结构、信封剥离全部集中在拦截器
- **接口变更只重新生成**:Service/Model 由 OpenAPI 文档驱动,业务消费代码通常零改动
- **分页参数治理**:`excludeQueryParams` 剔除通用分页字段后,分页在业务层自行传递
