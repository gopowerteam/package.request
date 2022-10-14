import { AdapterResponse, RequestAdapter, RequestAdapterOptions } from "../interfaces/request-adapter.interface";
export declare class AxiosAdapter implements RequestAdapter {
    private static axiosInstance;
    /**
     * 获取Axios实例
     */
    private getAxiosInstance;
    /**
     * 发送请求
     * @param options 请求参数
     * @returns AxiosResponse
     */
    request({ baseURL, pathURL, headers, method, params, data, }: RequestAdapterOptions): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * 转换Response
     * @param response
     * @returns
     */
    transformResponse(response: any): AdapterResponse;
}
