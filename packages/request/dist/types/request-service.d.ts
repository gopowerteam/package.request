import { RequestPlugin } from "./interfaces/request-plugin.interface";
import { RequestSendOptions } from "./interfaces/request-send.interface";
import { RequestSetupConfig } from "./interfaces/request-setup.interface";
export declare class RequestService {
    static config: RequestSetupConfig;
    static instance: RequestService;
    /**
     * 获取服务请求单例
     */
    static getInstance(): RequestService;
    /**
     * 获取RequestAdatper
     * @returns
     */
    private getRequestAdapter;
    /**
     * 执行前置插件逻辑
     * @param plugins
     * @param options
     */
    private execRequestPlugin;
    /**
     * 执行前置插件逻辑
     * @param plugins
     * @param options
     */
    private execResponsePlugin;
    /**
     * 开始请求
     * @param adapter
     * @param options
     * @returns
     */
    private startRequest;
    /**
     * 执行拦截器
     * @param response 请求响应对象
     * @returns
     */
    private execInterceptors;
    /**
     * 发送请求
     * @param {RequestSendOptions} options 请求选项
     * @param {RequestPlugin[]} plugins 请求插件
     * @returns
     */
    send(options: RequestSendOptions, plugins?: RequestPlugin[]): Promise<any>;
}
