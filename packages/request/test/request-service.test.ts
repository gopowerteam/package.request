import { RequestSetupConfig } from '../src/interfaces/request-setup.interface'
import { RequestService } from '../src/request-service'
import { setup } from '../src/request-setup'
import { TestRequestPlugin } from './request-plugin'
import {
  ErrorInterceptors,
  ExceptionInterceptors,
  StatusInterceptors,
  SuccessInterceptors
} from './response-interceptors'

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

describe('测试RequestService', () => {
  test('测试正常请求', async () => {
    setup(config)
    // 请求实例
    const request = RequestService.getInstance()

    // 请求数据
    const data = await request.send(
      {
        path: '/api/admin/app/app-base',
        method: 'GET'
      },
      []
    )

    // 校验结果
    expect(typeof data).toBe('object')
  })

  test('测试异常请求', async () => {
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
          method: 'GET'
        },
        []
      )
      .catch(errorHandle)
    // 校验执行
    expect(exceptionHandle).toHaveBeenCalled()
    expect(errorHandle).toHaveBeenCalled()
  })

  test('测试插件正常生命周期', async () => {
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
        method: 'GET'
      },
      [plugin]
    )

    // 校验执行
    expect(beforeHook).toHaveBeenCalled()
    expect(afterHook).toHaveBeenCalled()
  })

  test('测试插件异常生命周期', async () => {
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
          method: 'POST'
        },
        [plugin]
      )
      .catch(() => {
        //
      })

    // 校验执行
    expect(catchHook).toHaveBeenCalled()
  })
})
