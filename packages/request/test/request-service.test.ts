import { AxiosAdapter } from '../src/adapters'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'
import { TestRequestPlugin } from './request-plugin'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors,
} from './response-interceptors'
import type { RequestSetupConfig } from '../src/interfaces/request-setup.interface'

const config: RequestSetupConfig = {
  gateway: 'https://mall-service.gopowerteam.cn',
  adapter: new AxiosAdapter(),
  interceptors: {
    status: new StatusInterceptors(),
    success: new SuccessInterceptors(),
    error: new ErrorInterceptors(),
    exception: new ExceptionInterceptors(),
  },
  plugins: [],
}

describe('测试RequestService', () => {
  it('测试正常请求', async () => {
    setup(config)
    // 请求实例
    const request = RequestService.getInstance()

    // 请求数据
    const data = await request.send(
      {
        path: '/api/admin/app/app-base',
        method: 'GET',
      },
      [],
    )

    // 校验结果
    expect(typeof data).toBe('object')
  })

  it('测试异常请求', async () => {
    // 替换异常方法
    const errorHandle = jest.fn()
    const exceptionHandle = jest.fn()
    config.interceptors.exception.exec = exceptionHandle

    // 配置RequestService
    setup(config)
    // 请求实例
    const request = RequestService.getInstance()
    // 请求数据
    await request
      .send(
        {
          path: '/api/admin/app/app---',
          method: 'GET',
        },
        [],
      )
      .catch(errorHandle)
    // 校验执行
    expect(exceptionHandle).toHaveBeenCalled()
    expect(errorHandle).toHaveBeenCalled()
  })

  it('测试插件正常生命周期', async () => {
    // 配置RequestService
    const beforeHook = jest.fn()
    const afterHook = jest.fn()

    setup(config)
    // 请求实例
    const request = RequestService.getInstance()

    const plugin = new TestRequestPlugin()

    plugin.before = () => beforeHook()
    plugin.after = () => afterHook()

    // 请求数据
    await request.send(
      {
        path: '/api/admin/app/app-base',
        method: 'GET',
        paramsQuery: {
          a: [1, 2, 3, 4, 5],
        },
      },
      [plugin],
    )

    // 校验执行
    expect(beforeHook).toHaveBeenCalled()
    expect(afterHook).toHaveBeenCalled()
  })

  it('测试插件异常生命周期', async () => {
    // 配置RequestService
    const catchHook = jest.fn()

    setup(config)
    // 请求实例
    const request = RequestService.getInstance()

    const plugin = new TestRequestPlugin()

    plugin.catch = () => catchHook()

    // 请求数据
    await request
      .send(
        {
          path: '/api/admin/app/app-base',
          method: 'POST',
        },
        [plugin],
      )
      .catch(() => {
        //
      })

    // 校验执行
    expect(catchHook).toHaveBeenCalled()
  })
})
