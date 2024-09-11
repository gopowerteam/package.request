import type { AdapterResponse } from '../src/interfaces/request-adapter.interface'
import type { RequestPlugin } from '../src/interfaces/request-plugin.interface'
import type { RequestSendOptions } from '../src/interfaces/request-send.interface'

export class TestRequestPlugin implements RequestPlugin {
  before: (options: RequestSendOptions) => void
  after: (response: AdapterResponse, options: RequestSendOptions) => void
  finally: (response: AdapterResponse, options: RequestSendOptions) => void
  catch: (response: AdapterResponse, options: RequestSendOptions) => void
}
