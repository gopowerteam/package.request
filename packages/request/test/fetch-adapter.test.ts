import { FetchAdapter } from '../src/adapters/fetch.adapter'

/**
 * 构造一个可控的 mock Response
 */
function mockResponse(
  body: BodyInit | null = null,
  init: { status?: number, statusText?: string, contentType?: string } = {},
): Response {
  const { status = 200, statusText = 'OK', contentType = 'application/json' } = init
  return new Response(body, {
    status,
    statusText,
    headers: contentType
      ? { 'Content-Type': contentType }
      : {},
  })
}

/**
 * 记录 fetch 调用参数的 mock 实现
 */
function createMockFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: { url: string, init: RequestInit }[] = []
  const impl = (async (url: any, init: any) => {
    calls.push({
      url: String(url),
      init,
    })
    return handler(String(url), init)
  }) as typeof fetch

  return { impl, calls }
}

function setupAdapter(
  fetchImpl: typeof fetch,
  config: Record<string, unknown> = {},
): FetchAdapter {
  const adapter = new FetchAdapter()
  adapter.injectConfig({
    gateway: 'https://api.test',
    fetch: fetchImpl,
    ...config,
  } as any)
  return adapter
}

describe('fetchAdapter - 基础请求', () => {
  it('应使用 baseURL + pathURL 拼接请求地址', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    })

    expect(calls[0].url).toBe('https://api.test/users')
    expect(calls[0].init.method).toBe('GET')
  })

  it('应将 method 规范为大写', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'post',
      headers: {},
    })

    expect(calls[0].init.method).toBe('POST')
  })

  it('应透传 signal', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)
    const controller = new AbortController()

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
      signal: controller.signal,
    })

    expect(calls[0].init.signal).toBeDefined()
  })
})

describe('fetchAdapter - 查询参数序列化', () => {
  const requestWithQuery = async (paramsQuery: Record<string, unknown>, qs?: any) => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl, qs
      ? { qs }
      : {})
    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
      paramsQuery,
    })
    return calls[0].url
  }

  it('应使用默认 repeat 格式拼接数组', async () => {
    expect(await requestWithQuery({
      ids: [1, 2],
    })).toBe('https://api.test/users?ids=1&ids=2')
  })

  it('应按默认配置排序键名', async () => {
    expect(await requestWithQuery({ b: 1, a: 2 })).toBe('https://api.test/users?a=2&b=1')
  })

  it('应过滤空字符串与 null', async () => {
    expect(await requestWithQuery({ a: '', b: null, c: 'x' })).toBe('https://api.test/users?c=x')
  })

  it('应展开嵌套对象(allowDots)', async () => {
    expect(await requestWithQuery({
      filter: { name: 'foo' },
    }))
      .toBe('https://api.test/users?filter.name=foo')
  })

  it('参数为空时不应附加问号', async () => {
    expect(await requestWithQuery({})).toBe('https://api.test/users')
  })

  it('自定义 qs 选项应覆盖默认值', async () => {
    expect(await requestWithQuery({
      ids: [1, 2],
    }, { arrayFormat: 'comma' }))
      .toBe('https://api.test/users?ids=1%2C2')
  })

  it('路径已含查询串时应使用 & 连接', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users?lang=zh',
      method: 'GET',
      headers: {},
      paramsQuery: { page: 1 },
    })

    expect(calls[0].url).toBe('https://api.test/users?lang=zh&page=1')
  })
})

describe('fetchAdapter - Content-Type 推断', () => {
  const headersOf = async (paramsBody: unknown, method = 'POST') => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)
    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/upload',
      method,
      headers: {},
      paramsBody,
    })
    return new Headers(calls[0].init.headers as any)
  }

  it('formData 不应设置 Content-Type(交由运行时补 boundary)', async () => {
    const fd = new FormData()
    fd.append('file', new Blob(['x']), 't.txt')

    const headers = await headersOf(fd)
    expect(headers.get('Content-Type')).toBeNull()
  })

  it('uRLSearchParams 不应设置 Content-Type', async () => {
    const headers = await headersOf(new URLSearchParams('a=1'))
    expect(headers.get('Content-Type')).toBeNull()
  })

  it('blob 应使用其自带 type', async () => {
    const headers = await headersOf(new Blob(['x'], { type: 'image/png' }))
    expect(headers.get('Content-Type')).toBe('image/png')
  })

  it('无 type 的 Blob 应回落 application/octet-stream', async () => {
    const headers = await headersOf(new Blob(['x']))
    expect(headers.get('Content-Type')).toBe('application/octet-stream')
  })

  it('普通对象应设置 application/json', async () => {
    const headers = await headersOf({ name: 'foo' })
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('调用方显式设置的 Content-Type 不应被覆盖', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/upload',
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      paramsBody: new Blob(['x']),
    })

    expect(new Headers(calls[0].init.headers as any).get('Content-Type'))
      .toBe('application/xml')
  })

  it('值为 false 的头应被删除', async () => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)

    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: { 'X-Trace': false, 'X-Keep': 'yes' },
    })

    const headers = new Headers(calls[0].init.headers as any)
    expect(headers.get('X-Trace')).toBeNull()
    expect(headers.get('X-Keep')).toBe('yes')
  })
})

describe('fetchAdapter - 请求体构造', () => {
  const bodyOf = async (paramsBody: unknown, method: string) => {
    const { impl, calls } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)
    await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method,
      headers: {},
      paramsBody,
    })
    return calls[0].init.body
  }

  it('普通对象应序列化为 JSON 字符串', async () => {
    expect(await bodyOf({ name: 'foo' }, 'POST')).toBe('{"name":"foo"}')
  })

  it('字符串应原样透传', async () => {
    expect(await bodyOf('raw', 'POST')).toBe('raw')
  })

  it('formData 应原样透传', async () => {
    const fd = new FormData()
    expect(await bodyOf(fd, 'POST')).toBe(fd)
  })

  it('gET 请求不应携带 body', async () => {
    expect(await bodyOf({ name: 'foo' }, 'GET')).toBeUndefined()
  })

  it('hEAD 请求不应携带 body', async () => {
    expect(await bodyOf({ name: 'foo' }, 'HEAD')).toBeUndefined()
  })

  it('无 body 时不应设置', async () => {
    expect(await bodyOf(undefined, 'POST')).toBeUndefined()
  })
})

describe('fetchAdapter - 响应解析', () => {
  it('application/json 应解析为对象', async () => {
    const { impl } = createMockFetch(() => mockResponse('{"id":1}', { contentType: 'application/json' }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    })

    expect(adapter.transformResponse(raw).data).toEqual({ id: 1 })
  })

  it('+json 后缀应解析为对象', async () => {
    const { impl } = createMockFetch(() => mockResponse('{"id":1}', { contentType: 'application/vnd.api+json' }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    })

    expect(adapter.transformResponse(raw).data).toEqual({ id: 1 })
  })

  it('空 JSON 响应应返回空对象', async () => {
    const { impl } = createMockFetch(() => mockResponse('', { contentType: 'application/json' }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'DELETE',
      headers: {},
    })

    expect(adapter.transformResponse(raw).data).toEqual({})
  })

  it('text/plain 应返回字符串', async () => {
    const { impl } = createMockFetch(() => mockResponse('hello', { contentType: 'text/plain' }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/ping',
      method: 'GET',
      headers: {},
    })

    expect(adapter.transformResponse(raw).data).toBe('hello')
  })

  it('responseType=blob 应返回 Blob', async () => {
    const { impl } = createMockFetch(() => mockResponse('bin', { contentType: 'application/octet-stream' }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/file',
      method: 'GET',
      headers: {},
      extraParams: { responseType: 'blob' },
    })

    expect(adapter.transformResponse(raw).data).toBeInstanceOf(Blob)
  })

  it('应把响应头转换为普通对象', async () => {
    const { impl } = createMockFetch(() => new Response('{}', {
      headers: { 'X-Request-Id': 'abc' },
    }))
    const adapter = setupAdapter(impl)

    const raw = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    })

    expect(adapter.transformResponse(raw).headers['x-request-id']).toBe('abc')
  })
})

describe('fetchAdapter - 异常转换', () => {
  it('非 2xx 应拒绝并携带真实 status', async () => {
    const { impl } = createMockFetch(() =>
      mockResponse('{"message":"bad"}', { status: 400, statusText: 'Bad Request' }))
    const adapter = setupAdapter(impl)

    const exception = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    }).then(() => null).catch(e => e)

    const result = adapter.transformException(exception)
    expect(result.status).toBe(400)
    expect(result.statusText).toBe('Bad Request')
    expect(result.data).toEqual({ message: 'bad' })
    expect(result.canceled).toBeFalsy()
  })

  it('预终止 signal 应标记 canceled', async () => {
    const { impl } = createMockFetch(() => mockResponse('{}'))
    const adapter = setupAdapter(impl)
    const controller = new AbortController()
    controller.abort()

    const exception = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
      signal: controller.signal,
    }).then(() => null).catch(e => e)

    const result = adapter.transformException(exception)
    expect(result.canceled).toBe(true)
    expect(result.status).toBe(400)
  })

  it('网络异常(无响应)应回落 400', async () => {
    const adapter = new FetchAdapter()
    const result = adapter.transformException(new TypeError('Network Error'))

    expect(result.status).toBe(400)
    expect(result.data).toEqual({})
    expect(result.canceled).toBeFalsy()
  })

  it('应正确处理 500 服务器错误', async () => {
    const { impl } = createMockFetch(() =>
      mockResponse('{"error":"boom"}', { status: 500, statusText: 'Internal Server Error' }))
    const adapter = setupAdapter(impl)

    const exception = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/users',
      method: 'GET',
      headers: {},
    }).then(() => null).catch(e => e)

    const result = adapter.transformException(exception)
    expect(result.status).toBe(500)
    expect(result.data).toEqual({ error: 'boom' })
  })
})

describe('fetchAdapter - 超时', () => {
  it('超时后应中止请求并标记 canceled', async () => {
    // 永不 resolve 的 fetch,等待 signal 中止
    const impl = ((_url: any, init: any) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        reject(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }))
      })
    })) as unknown as typeof fetch

    const adapter = setupAdapter(impl, { timeout: 10 })

    const exception = await adapter.request({
      baseURL: 'https://api.test',
      pathURL: '/slow',
      method: 'GET',
      headers: {},
    }).then(() => null).catch(e => e)

    const result = adapter.transformException(exception)
    expect(result.canceled).toBe(true)
  })
})
