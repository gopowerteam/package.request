import type { OperationParameter } from '../../src/entities/operation-parameter'
import process from 'node:process'
import { beforeEach, describe, expect, it } from 'vitest'
import { Operation } from '../../src/entities/operation'
import { Service } from '../../src/entities/service'
import { Generate } from '../../src/generate'
import { writeServices } from '../../src/generate/write-services'
import { registerHandlebarTemplates } from '../../src/template'

/**
 * 构造一个带 mediaType 的 body 参数
 */
function makeBodyParam(
  type: string,
  mediaType?: string,
): OperationParameter {
  return {
    name: 'requestBody',
    in: 'body',
    type,
    ref: type,
    imports: [],
    mediaType,
  } as OperationParameter
}

/**
 * 生成单个 service 文件并返回其内容
 */
async function generateFor(bodyParam: OperationParameter): Promise<string> {
  const { default: fs } = await import('node:fs')
  const { default: path } = await import('node:path')
  const os = await import('node:os')

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-media-'))
  const cwd = process.cwd()
  process.chdir(tmpDir)

  try {
    Generate.options = {
      gateway: '',
      openapi: '',
      output: tmpDir,
      exportModels: false,
    }

    const operation = new Operation('upload', 'post', '/upload')
    operation.responseRef = 'void'
    operation.parametersBody = bodyParam

    const service = new Service('File')
    service.operations.push(operation)

    writeServices(
      { services: [service], models: [] },
      { output: tmpDir, application: 'mall', exportModels: false, input: '' },
    )

    return fs.readFileSync(
      path.join(tmpDir, 'services', 'FileService.ts'),
      'utf-8',
    )
  }
  finally {
    process.chdir(cwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

describe('writeServices - media-type headers 注入端到端', () => {
  beforeEach(() => {
    // 注册模板(幂等)
    registerHandlebarTemplates()
  })

  it('multipart/form-data 不应注入 headers(交给运行时计算 boundary)', async () => {
    const generated = await generateFor(
      makeBodyParam('FormData', 'multipart/form-data'),
    )

    expect(generated).toContain('paramsBody: requestBody')
    expect(generated).not.toContain('Content-Type')
    expect(generated).not.toMatch(/^\s*headers:/m)
  })

  it('application/pdf 应注入 Content-Type: application/pdf', async () => {
    const generated = await generateFor(
      makeBodyParam('Blob', 'application/pdf'),
    )

    expect(generated).toContain(
      `headers: { 'Content-Type': 'application/pdf' }`,
    )
    expect(generated).toContain('paramsBody: requestBody')
  })

  it('application/octet-stream 应注入 Content-Type: application/octet-stream', async () => {
    const generated = await generateFor(
      makeBodyParam('Blob', 'application/octet-stream'),
    )

    expect(generated).toContain(
      `headers: { 'Content-Type': 'application/octet-stream' }`,
    )
  })

  it('application/x-www-form-urlencoded 应注入对应 Content-Type', async () => {
    const generated = await generateFor(
      makeBodyParam('URLSearchParams', 'application/x-www-form-urlencoded'),
    )

    expect(generated).toContain(
      `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }`,
    )
  })

  it('text/csv 应注入 Content-Type: text/csv', async () => {
    const generated = await generateFor(
      makeBodyParam('string', 'text/csv'),
    )

    expect(generated).toContain(`headers: { 'Content-Type': 'text/csv' }`)
  })

  it('image/png 应注入 Content-Type: image/png', async () => {
    const generated = await generateFor(
      makeBodyParam('Blob', 'image/png'),
    )

    expect(generated).toContain(`headers: { 'Content-Type': 'image/png' }`)
  })

  it('jSON body(mediaType undefined)不应注入 headers', async () => {
    const generated = await generateFor(makeBodyParam('User'))

    expect(generated).toContain('paramsBody: requestBody')
    expect(generated).not.toContain('Content-Type')
    expect(generated).not.toMatch(/^\s*headers:/m)
  })

  it('jSON 家族 mediaType 也不应注入(双守卫,is-json-media 拦截)', async () => {
    // 模拟 resolveFromContent 对 JSON 家族不会写入 mediaType,
    // 但若上游误写入,is-json-media helper 也应兜底拦截
    const generated = await generateFor(
      makeBodyParam('string', 'application/json; charset=utf-8'),
    )

    expect(generated).not.toContain('Content-Type')
    expect(generated).not.toMatch(/^\s*headers:/m)
  })

  it('*/* media 也不应注入(按 JSON 处理)', async () => {
    const generated = await generateFor(
      makeBodyParam('any', '*/*'),
    )

    expect(generated).not.toContain('Content-Type')
    expect(generated).not.toMatch(/^\s*headers:/m)
  })
})
