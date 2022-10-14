import { AxiosAdapter } from "./adapters/axios.adapter";
import {
  AdapterResponse,
  RequestAdapter,
} from "./interfaces/request-adapter.interface";
import {
  PluginLifecycle,
  RequestPlugin,
  ResponseLifecycle,
} from "./interfaces/request-plugin.interface";
import { RequestSendOptions } from "./interfaces/request-send.interface";
import { RequestSetupConfig } from "./interfaces/request-setup.interface";

export class RequestService {
  static config: RequestSetupConfig;

  static instance: RequestService;

  /**
   * 获取服务请求单例
   */
  public static getInstance(): RequestService {
    if (this.instance) {
      return this.instance;
    }

    return new RequestService();
  }

  /**
   * 获取RequestAdatper
   * @returns
   */
  private getRequestAdapter(): RequestAdapter {
    if (typeof RequestService.config.adapter === "string") {
      switch (RequestService.config.adapter) {
        case "axios":
          return new AxiosAdapter();
      }
    }

    if (!RequestService.config.adapter) {
      throw new Error("请检查是否配置请求Adatper");
    }

    return RequestService.config.adapter;
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
    );

    // 执行全局插件
    plugins.forEach((service) => service.before && service.before(options));
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
    // 执行上下文插件
    RequestService.config.plugins.forEach(
      (service) => service[leftcycle] && service[leftcycle](response, options)
    );

    // 执行全局插件
    plugins.forEach(
      (service) => service[leftcycle] && service[leftcycle](response, options)
    );
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
      pathURL: options.path,
      params: options.params,
      data: options.data,
      headers: options.headers || {},
      method: options.method,
    });
  }

  /**
   * 执行拦截器
   * @param response 请求响应对象
   * @returns
   */
  private execInterceptors(response: AdapterResponse) {
    const interceptors = RequestService.config?.interceptors;
    if (
      !interceptors?.status ||
      !interceptors?.error ||
      !interceptors?.success ||
      !interceptors?.exception
    ) {
      throw new Error("请检查拦截器配置");
    }

    // 获取执行状态
    const status = interceptors.status.exec(response);

    if (status) {
      // 成功状态
      return interceptors.status.exec(response);
    } else {
      // 失败状态
      return interceptors.error.exec(response);
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
      throw new Error("请检查请求配置是否完成");
    }

    // 获取请求适配器
    const adapter = this.getRequestAdapter();

    // 执行前置插件
    this.execRequestPlugin(plugins, options);

    // 开始进行请求

    const response = await this.startRequest(adapter, options)
      // 异常请求处理
      .catch((response) => {
        // 获取异常拦截器
        const exceptionInterceptor =
          RequestService.config?.interceptors?.exception;

        // 执行异常拦截器
        if (exceptionInterceptor) {
          exceptionInterceptor.exec(adapter.transformResponse(response));
        }

        return response;
      })
      .then(adapter.transformResponse);

    // 执行前置插件
    this.execResponsePlugin(PluginLifecycle.after, plugins, options, response);

    // 执行拦截器
    return this.execInterceptors(response);
  }
}
