import { AdapterResponse } from "./request-adapter.interface";

export interface ResponseInterceptor {
  exec(response: AdapterResponse): any;
}
