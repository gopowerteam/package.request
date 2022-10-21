import { ResponseInterceptor, AdapterResponse } from '@gopowerteam/request/src'

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
    console.log('发生异常')
  }
}
