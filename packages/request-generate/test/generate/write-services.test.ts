import { beforeEach, describe, expect, it } from 'vitest'
import { Operation } from '../../src/entities/operation'
import { Service } from '../../src/entities/service'
import { Generate } from '../../src/generate'
import { writeServices } from '../../src/generate/write-services'
import { registerHandlebarTemplates } from '../../src/template'

describe('writeServices - 不修改原始 entity', () => {
  beforeEach(() => {
    // 注册模板(只在第一次调用时实际注册,后续重复调用幂等)
    registerHandlebarTemplates()
  })

  it('appendService=true 时原始 service.application 不应被修改', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: tmpDir,
        exportModels: false,
        appendService: true,
      }

      const operation = new Operation('getUser', 'get', '/users/{id}')
      operation.responseRef = 'User'

      const service = new Service('User')
      service.application = 'ORIGINAL_VALUE'
      service.operations.push(operation)

      const originalApplication = service.application

      writeServices(
        { services: [service], models: [] },
        { output: tmpDir, application: 'mall', exportModels: false, input: '' },
      )

      // 关键断言:原始 entity 未被修改
      expect(service.application).toBe(originalApplication)

      // 生成的文件应存在
      expect(fs.existsSync(path.join(tmpDir, 'services', 'UserService.ts'))).toBe(true)
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('appendService=false 时 application 应为空字符串且不污染原始 entity', async () => {
    const { default: fs } = await import('node:fs')
    const { default: path } = await import('node:path')
    const os = await import('node:os')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
    const cwd = process.cwd()
    process.chdir(tmpDir)

    try {
      Generate.options = {
        gateway: '',
        openapi: '',
        output: tmpDir,
        exportModels: false,
        appendService: false,
      }

      const operation = new Operation('listUsers', 'get', '/users')
      operation.responseRef = 'void'

      const service = new Service('User')
      service.application = 'ORIGINAL'
      service.operations.push(operation)

      writeServices(
        { services: [service], models: [] },
        { output: tmpDir, application: 'ignored', exportModels: false, input: '' },
      )

      expect(service.application).toBe('ORIGINAL')
    }
    finally {
      process.chdir(cwd)
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
