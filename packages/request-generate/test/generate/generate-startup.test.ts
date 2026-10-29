import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import type { GenerateOptions } from '../../src/types/generate-options'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { OpenAPIVersion } from '../../src/config/enum.config'
import { Generate } from '../../src/generate'
import { getConfigFingerprint, readLocalConfig } from '../../src/generate/write-config'
import { generateServiceOptions } from '../../src/utils/get-services-options'
import v2Minimal from '../fixtures/v2-minimal.json'
import v3Minimal from '../fixtures/v3-minimal.json'

type UnknownVersionDocument = OpenAPIV3.Document & OpenAPIV2.Document

function md5Of(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * 在临时目录中执行异步用例(结束后恢复 cwd 并清理)
 */
async function withTempCwd(fn: (tmpDir: string) => Promise<void>) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
  const cwd = process.cwd()
  process.chdir(tmpDir)

  try {
    await fn(tmpDir)
  }
  finally {
    process.chdir(cwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

function createOptions(overrides: Partial<GenerateOptions> = {}): GenerateOptions {
  return {
    gateway: 'https://gw.example.com',
    openapi: '/v2/api-docs',
    output: 'generated',
    exportModels: true,
    logger: false,
    ...overrides,
  }
}

/**
 * 准备本地文档(模拟 download 阶段写入 .request 的产物)
 */
function prepareLocalDocument(name: string, content: unknown) {
  fs.mkdirSync('.request', { recursive: true })
  fs.writeFileSync(path.join('.request', `${name}.json`), JSON.stringify(content))
}

describe('generate.startup - 编排流程', () => {
  it('v2 文档应完成 解析→写入→账本提交 全流程', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('app', v2Minimal)

      const options = createOptions({ applications: { app: 'mall-service' } })
      await Generate.startup(options)

      expect(Generate.options).toBe(options)

      // 产物落盘
      expect(fs.existsSync(path.join('generated', 'app', 'models', 'User.ts'))).toBe(true)
      expect(fs.existsSync(path.join('generated', 'app', 'models', '.generated'))).toBe(true)
      expect(fs.existsSync(path.join('generated', 'app', 'services', 'UserService.ts'))).toBe(true)

      // 账本提交:md5 与生成规则指纹均与本次运行一致
      const appOptions = generateServiceOptions(options)[0]
      const config = readLocalConfig()
      expect(config).toHaveLength(1)
      expect(config[0]).toMatchObject({
        name: 'app',
        md5: md5Of(JSON.stringify(v2Minimal)),
        configMd5: getConfigFingerprint(options, appOptions),
      })
    })
  })

  it('v3 文档应走 parseV3 分支并生成产物', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('app', v3Minimal)

      const options = createOptions({
        openapi: '/v3/api-docs',
        applications: { app: 'mall-service' },
      })
      await Generate.startup(options)

      const userModel = fs.readFileSync(path.join('generated', 'app', 'models', 'User.ts'), 'utf-8')
      expect(userModel).toContain('export type User = {')
      expect(fs.existsSync(path.join('generated', 'app', 'services', 'UserService.ts'))).toBe(true)
    })
  })

  it('账本与指纹完全匹配时应跳过重新生成', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('app', v2Minimal)
      const options = createOptions({ applications: { app: 'mall-service' } })

      await Generate.startup(options)

      // 删除产物后二次运行:md5 与 configMd5 均未变化 → 跳过,不重建文件
      const userTs = path.join('generated', 'app', 'models', 'User.ts')
      fs.rmSync(userTs)

      await Generate.startup(options)

      expect(fs.existsSync(userTs)).toBe(false)
    })
  })

  it('文档不可解析时应中断且不提交账本、不落盘产物', async () => {
    await withTempCwd(async () => {
      // swagger-parser 在解析层即拒绝 swagger 1.2(版本守卫在 parse 阶段先触发)
      prepareLocalDocument('bad', { swagger: '1.2', info: { title: 'x', version: '1' }, paths: {} })

      const options = createOptions({ applications: { bad: 'legacy' } })

      await expect(Generate.startup(options)).rejects.toThrow(/请求文件.*失败,请稍后重试/)

      // 中途失败:产物与账本都不应落盘
      expect(fs.existsSync('generated')).toBe(false)
      expect(fs.existsSync(path.join('.request', '.config.json'))).toBe(false)
    })
  })

  it('文档内容损坏时应抛出包装后的错误', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('broken', '{ this is not json !!')

      const options = createOptions({ applications: { broken: 'svc' } })

      await expect(Generate.startup(options)).rejects.toThrow(/请求文件.*失败,请稍后重试/)
    })
  })

  it('logger:false 时不应产生 console 输出', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('app', v2Minimal)
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await Generate.startup(createOptions({ applications: { app: 'svc' }, logger: false }))

        expect(logSpy).not.toHaveBeenCalled()
      }
      finally {
        logSpy.mockRestore()
      }
    })
  })

  it('默认开启日志时应输出横幅与汇总表格', async () => {
    await withTempCwd(async () => {
      prepareLocalDocument('app', v2Minimal)
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await Generate.startup(createOptions({ applications: { app: 'svc' }, logger: true }))

        const output = logSpy.mock.calls.map(args => args.join(' ')).join('\n')
        expect(output).toContain('开始生成接口代码')
        expect(output).toContain('app') // 汇总表格中的应用名
      }
      finally {
        logSpy.mockRestore()
      }
    })
  })
})

describe('generate.generateClient - 版本分派', () => {
  it('v2 应走 parseV2', () => {
    const client = Generate.generateClient(
      v2Minimal as unknown as UnknownVersionDocument,
      OpenAPIVersion.V2,
    )

    expect(client.models.map(model => model.name)).toContain('User')
    expect(client.services.map(service => service.name)).toEqual(['User'])
  })

  it('v3 应走 parseV3', () => {
    const client = Generate.generateClient(
      v3Minimal as unknown as UnknownVersionDocument,
      OpenAPIVersion.V3,
    )

    expect(client.services.map(service => service.name)).toEqual(['User'])
  })

  it('未知版本应抛出明确错误', () => {
    expect(() =>
      Generate.generateClient({} as UnknownVersionDocument, 4 as OpenAPIVersion),
    ).toThrow(/不支持的OpenAPI版本: 4/)
  })
})

describe('generate.getApiDocument - 错误包装', () => {
  it('成功时应返回解析后的文档', async () => {
    await withTempCwd(async (tmpDir) => {
      const file = path.join(tmpDir, 'doc.json')
      fs.writeFileSync(file, JSON.stringify(v2Minimal))

      const document = await Generate.getApiDocument(file)

      expect(document.info.title).toBe('Minimal V2 API')
    })
  })

  it('底层失败时应抛出包装错误', async () => {
    await expect(Generate.getApiDocument('')).rejects.toThrow(/请求文件\[\]失败/)
  })
})
