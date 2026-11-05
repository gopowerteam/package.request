# Observable 模式

`@gopowerteam/request` 与生成的 Service 均支持 **Promise / Observable 双响应模式**。

## 按需安装 rxjs

- **promise 模式**(默认):宿主**无需安装 rxjs** —— 主入口 `@gopowerteam/request` 的类型声明不引用 rxjs
- **observable 模式**:需要 `rxjs` >= 7

rxjs 以**可选 peer 依赖**存在,唯一携带 rxjs 运行时引用的入口是子路径 `@gopowerteam/request/observable`;dist 主入口零 rxjs 引用,promise 模式宿主的依赖树保持干净。

## ObservableGenerateRequestService

子路径 `@gopowerteam/request/observable` 导出 `ObservableGenerateRequestService` —— `GenerateRequestService` 的 Observable 版基类:

- **URL 分支**:`RequestGenerateType.URL` 时直接返回 `this.request.toURL(...)` 字符串,与 promise 基类一致
- **数据分支**:`sendData<R>` 用 `rxjs.from()` 包装请求 Promise,返回 `Observable<R>`
- 未标注泛型时默认 `R = any`,与历史行为兼容

```ts
import { ObservableGenerateRequestService } from '@gopowerteam/request/observable'
import { firstValueFrom } from 'rxjs'

class UserService extends ObservableGenerateRequestService {
  getUser(params: UserParams) {
    return this.generateRequest<UserInfo>({ path: '/users/1', method: 'get' })
  }
}

// Observable 消费
userService.getUser({}).subscribe(user => console.log(user))

// 也可以转回 Promise
const user = await firstValueFrom(userService.getUser({}))
```

## 切换生成模式

`request-generate` 的 `responseType` 一键切换:

```ts
exportServices: {
  responseType: 'observable', // 'promise' | 'observable'
}
```

切换后生成的 Service 方法返回 `Observable<T>`(内部用 `rxjs.from` 包装),适合 Angular / RxJS 项目配合管道操作符使用。两种模式下生成代码的结构完全一致,切换零成本。

## 类型设计说明

覆写协变约束:`Observable<R>` 不可赋值给 `Promise<R>`,因此基类以本地结构化的 `ObservableLike<T>` 接口(仅 `subscribe` 签名)声明返回类型 —— 既允许 rxjs `Observable` 结构化覆写,又保证主入口 `.d.ts` 不引入 rxjs 类型引用。

相关变更记录见仓库 `packages/request` 与 `packages/request-generate` 的 README 及 changelog。
