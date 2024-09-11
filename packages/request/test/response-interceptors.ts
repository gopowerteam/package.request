import type { AdapterResponse } from '../src/interfaces/request-adapter.interface'
import type { ResponseInterceptor } from '../src/interfaces/response-interceptor.interface'

export class StatusInterceptors implements ResponseInterceptor {
  exec() {
    return true
  }
}

export class SuccessInterceptors implements ResponseInterceptor {
  exec(response: AdapterResponse) {
    return response.data
  }
}

export class ErrorInterceptors implements ResponseInterceptor {
  exec(response: AdapterResponse) {
    return response.data
  }
}

export class ExceptionInterceptors implements ResponseInterceptor {
  exec(data: AdapterResponse) {
    console.error('发生异常', data)
  }
}
