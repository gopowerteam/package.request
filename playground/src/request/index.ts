import { setup } from '@gopowerteam/request'
import { RequestSetupConfig } from '@gopowerteam/request'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors
} from './response-interceptors'
import { AppService } from '../generated/services/AppService'
const config: RequestSetupConfig = {
  gateway: 'https://mall-service.gopowerteam.cn',
  adapter: 'axios',
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

  appService.appBase().then((data) => {
    console.log(data)
  })
}

bootstrap()
