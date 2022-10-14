import { AdapterResponse } from "../src/interfaces/request-adapter.interface";
import { RequestPlugin } from "../src/interfaces/request-plugin.interface";
import { RequestSendOptions } from "../src/interfaces/request-send.interface";

export class TestRequestPlugin implements RequestPlugin {
  before: (options: RequestSendOptions) => void;
  after: (response: AdapterResponse, options: RequestSendOptions) => void;
  finally: (response: AdapterResponse, options: RequestSendOptions) => void;
  catch: (response: AdapterResponse, options: RequestSendOptions) => void;
}
