import {
  setup,
} from '@gopowerteam/request'
import { AxiosAdapter } from '@gopowerteam/request/adapters'
import type {
  RequestSetupConfig,
} from '@gopowerteam/request'
// import { AppService } from '../generated/services/AppService'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from './response-interceptors'

const config: RequestSetupConfig = {
  gateway: 'https://mall-service.gopowerteam.cn',
  adapter: new AxiosAdapter(),
  timeout: 3000,
  interceptors: {
    status: new StatusInterceptors(),
    success: new SuccessInterceptors(),
    error: new ErrorInterceptors(),
    exception: new ExceptionInterceptors(),
  },
  plugins: [],
}

async function bootstrap() {
  setup(config)

  // const appService = new AppService()

  // appService.appBase([]).then((data: any) => {
  //   console.error(data)
  // })
}

bootstrap()
