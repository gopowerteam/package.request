import { RequestService, setup } from "@gopowerteam/request";
import { RequestSetupConfig } from "@gopowerteam/request";

import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from "./response-interceptors";

const config: RequestSetupConfig = {
  gateway: "https://mall-service.gopowerteam.cn",
  adapter: "axios",
  interceptors: {
    status: new StatusInterceptors(),
    success: new SuccessInterceptors(),
    error: new ErrorInterceptors(),
    exception: new ExceptionInterceptors(),
  },
  plugins: [],
};

async function bootstrap() {
  setup(config);
  // 请求实例
  const request = RequestService.getInstance();

  // 请求数据
  const data = await request.send(
    {
      path: "/api/admin/app/app-base",
      method: "GET",
    },
    []
  );

  console.log(data);
}

bootstrap();
