import { AdapterResponse } from "./request-adapter.interface";
export interface ResponseInterceptor<T> {
    exec(response: AdapterResponse): T;
}
