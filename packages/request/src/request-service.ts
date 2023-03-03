import qs from 'qs'
import {
  AdapterResponse,
  RequestAdapter
} from './interfaces/request-adapter.interface'
import {
  PluginLifecycle,
  RequestPlugin,
  ResponseLifecycle
} from './interfaces/request-plugin.interface'
import { RequestSendOptions } from './interfaces/request-send.interface'
import { RequestSetupConfig } from './interfaces/request-setup.interface'

export class RequestService {
  static config: RequestSetupConfig

  static instance: RequestService

  /**
   * 获取服务请求单例
   */
  public static getInstance(): RequestService {
    if (this.instance) {
      return this.instance
    }

    return new RequestService()
  }

  /**
   * 获取RequestAdatper
   * @returns
   */
  private getRequestAdapter(): RequestAdapter {
    if (!RequestService.config.adapter) {
      throw new Error('请检查是否配置请求Adatper')
    }

    return RequestService.config.adapter
  }

  /**
   * 执行前置插件逻辑
   * @param plugins
   * @param options
   */
  private execRequestPlugin(
    plugins: RequestPlugin[] = [],
    options: RequestSendOptions
  ) {
    // 执行上下文插件
    RequestService.config.plugins.forEach(
      (service) => service.before && service.before(options)
    )

    // 执行全局插件
    plugins.forEach((service) => service.before && service.before(options))
  }

  /**
   * 执行前置插件逻辑
   * @param plugins
   * @param options
   */
  private execResponsePlugin(
    leftcycle: ResponseLifecycle,
    plugins: RequestPlugin[] = [],
    options: RequestSendOptions,
    response: AdapterResponse
  ) {
    // 执行全局插件
    plugins.forEach((plugin) => {
      const leftcycleFn = plugin[leftcycle]
      leftcycleFn && leftcycleFn.bind(plugin)(response, options)
    })

    // 执行上下文插件
    RequestService.config.plugins.forEach((plugin) => {
      const leftcycleFn = plugin[leftcycle]
      leftcycleFn && leftcycleFn.bind(plugin)(response, options)
    })
  }

  /**
   * 转换请求路径
   */
  private parseRequestPath(
    path: string,
    paramsPath?: Record<string, string | number>,
    service?: string
  ): string {
    if (service) {
      path = `/${service}/${path}`.replace(/\/{2,3}/g, '/')
    }

    if (paramsPath) {
      return Object.entries(paramsPath).reduce<string>(
        (r, [key, value]) => r.replace(`{${key}}`, value.toString()),
        path
      )
    } else {
      return path
    }
  }

  /**
   * 开始请求
   * @param adapter
   * @param options
   * @returns
   */
  private startRequest(adapter: RequestAdapter, options: RequestSendOptions) {
    return adapter.request({
      baseURL: RequestService.config.gateway,
      pathURL: this.parseRequestPath(
        options.path,
        options.paramsPath,
        options.service
      ),
      method: options.method,
      headers: options.headers || {},
      paramsQuery: options.paramsQuery,
      paramsBody: options.paramsBody,
      responseType: options.responseType
    })
  }

  /**
   * 执行拦截器
   * @param response 请求响应对象
   * @returns
   */
  private execInterceptors(response: AdapterResponse, hasException = false) {
    const interceptors = RequestService.config?.interceptors

    if (
      !interceptors?.status ||
      !interceptors?.error ||
      !interceptors?.success ||
      !interceptors?.exception
    ) {
      throw new Error('请检查拦截器配置')
    }

    // 获取执行状态
    const status = interceptors.status.exec(response) && !hasException

    // 执行异常拦截器
    if (hasException) {
      interceptors.exception.exec(response)
    }

    // 直接返回转换拦截器
    if (status) {
      // 成功状态转换
      return Promise.resolve(interceptors.success.exec(response))
    } else {
      // 失败状态转换
      return Promise.reject(interceptors.error.exec(response))
    }
  }

  /**
   * 发送请求
   * @param {RequestSendOptions} options 请求选项
   * @param {RequestPlugin[]} plugins 请求插件
   * @returns
   */
  public async send(
    options: RequestSendOptions,
    plugins: RequestPlugin[] = []
  ): Promise<any> {
    if (!RequestService.config) {
      throw new Error('请检查请求配置是否完成')
    }

    // 请求异常标志
    let hasException = false

    // 获取请求适配器
    const adapter = this.getRequestAdapter()

    // 执行前置插件
    this.execRequestPlugin(plugins, options)

    // 开始进行请求
    const response = await this.startRequest(adapter, options)
      .then((response) => adapter.transformResponse(response))
      // 异常请求处理
      .catch((exception) => {
        hasException = true
        return adapter.transformException(exception)
      })

    // 执行前置插件
    if (!hasException) {
      this.execResponsePlugin(PluginLifecycle.after, plugins, options, response)
    } else {
      this.execResponsePlugin(PluginLifecycle.catch, plugins, options, response)
    }

    // 执行拦截器
    return this.execInterceptors(response, hasException)
  }

  /**
   * 生成请求路径
   * @param {RequestSendOptions} options 请求选项
   * @param {RequestPlugin[]} plugins 请求插件
   * @returns
   */
  public toURL(
    options: RequestSendOptions,
    plugins: RequestPlugin[] = []
  ): string {
    if (!RequestService.config) {
      throw new Error('请检查请求配置是否完成')
    }

    if (plugins && plugins.length) {
      // 执行前置插件
      this.execRequestPlugin(plugins, options)
    }

    const baseURL = RequestService.config.gateway
    const pathURL = this.parseRequestPath(
      options.path,
      options.paramsPath,
      options.service
    )
    const queryString = qs.stringify(options.paramsQuery, {
      ...{
        arrayFormat: 'repeat',
        skipNulls: true,
        allowDots: true,
        encodeValuesOnly: true,
        encode: true
      },
      ...(RequestService.config.qs || {}),
      addQueryPrefix: true
    })

    return `${baseURL}${pathURL}${queryString}`
  }
}
