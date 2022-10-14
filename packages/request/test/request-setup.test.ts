import { setup } from "../src/request-setup";
import { RequestService } from "../src/request-service";
import {
  StatusInterceptors,
  SuccessInterceptors,
  ErrorInterceptors,
  ExceptionInterceptors,
} from "./response-interceptors";

describe("测试request-setup", () => {
  test("测试SETUP函数", async () => {
    const config = {
      gateway: "https://mall-service.gopowerteam.cn",
      interceptors: {
        status: new StatusInterceptors(),
        success: new SuccessInterceptors(),
        error: new ErrorInterceptors(),
        exception: new ExceptionInterceptors(),
      },
      plugins: [],
    };

    // 安装配置
    setup(config);

    // 测试安装成功
    expect(RequestService.config.gateway).toEqual(config.gateway);
    expect(RequestService.config.interceptors.status).toEqual(
      config.interceptors.status
    );
    expect(RequestService.config.interceptors.success).toEqual(
      config.interceptors.success
    );
    expect(RequestService.config.interceptors.error).toEqual(
      config.interceptors.error
    );
    expect(RequestService.config.interceptors.exception).toEqual(
      config.interceptors.exception
    );
    expect(RequestService.config.plugins).toEqual(config.plugins);
  });
});
