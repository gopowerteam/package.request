import {
  setup,
  RequestSetupConfig,
  RequestGenerateType
} from '@gopowerteam/request'
import { AxiosAdapter } from '@gopowerteam/request/adapters'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors
} from './response-interceptors'
import { AppService } from '../generated/services/AppService'

const config: RequestSetupConfig = {
  gateway: 'https://mall-service.gopowerteam.cn',
  adapter: new AxiosAdapter(),
  timeout: 3000,
  interceptors: {
    status: new StatusInterceptors(),
    success: new SuccessInterceptors(),
    error: new ErrorInterceptors(),
    exception: new ExceptionInterceptors()
  },
  plugins: []
}

async function bootstrap() {
  setup(config)

  const appService = new AppService()

  console.log(appService.appBase([], { type: RequestGenerateType.URL }))

  appService.appBase([]).then((data) => {
    console.log(data)
  })
}

bootstrap()
