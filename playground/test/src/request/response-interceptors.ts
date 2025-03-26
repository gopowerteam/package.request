import type { AdapterResponse, ResponseInterceptor } from '@gopowerteam/request/src'

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
  exec() {
    console.error('发生异常')
  }
}
