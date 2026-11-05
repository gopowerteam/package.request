/**
 * rxjs Observable 的最小结构类型。
 *
 * 用途:让基类数据分支(`sendData` / `generateRequest`)的返回类型
 * 可被 Observable 子类的 rxjs `Observable<R>` 结构化覆写(协变出口),
 * 同时避免主入口类型声明引用 rxjs —— promise 模式宿主无需安装 rxjs
 * 即可解析类型。
 */
export interface ObservableLike<T> {
  subscribe: (observer?: {
    next?: (value: T) => void
    error?: (err: unknown) => void
    complete?: () => void
  }) => { unsubscribe: () => void } | void
}
