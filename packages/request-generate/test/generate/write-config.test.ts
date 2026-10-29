import type {
  GenerateApplicationOptions,
  GenerateOptions,
} from '../../src/types/generate-options'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  commitGenerationConfig,
  getConfigFingerprint,
  isNeedUpdate,
  planGeneration,
  readLocalConfig,
} from '../../src/generate/write-config'

function md5Of(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * 在临时目录中执行用例(结束后恢复 cwd 并清理)
 */
function withTempCwd(fn: (tmpDir: string) => void) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
  const cwd = process.cwd()
  process.chdir(tmpDir)

  try {
    fn(tmpDir)
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
    output: './generated',
    exportModels: true,
    ...overrides,
  }
}

describe('write-config - MD5 与账本读取', () => {
  it('readLocalConfig 在配置文件不存在时应返回空数组', async () => {
    withTempCwd(() => {
      expect(readLocalConfig()).toEqual([])
    })
  })

  it('readLocalConfig 在账本损坏时应返回空数组(容错,不中断)', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/.config.json', '{ not valid json !!')

      expect(readLocalConfig()).toEqual([])
    })
  })

  it('isNeedUpdate 应返回稳定 MD5(基于 Buffer 而非字符串)', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/test.json', '{"hello":"world"}')

      const md5First = isNeedUpdate('test', [], './generated', 'fingerprint')
      const md5Second = isNeedUpdate('test', [], './generated', 'fingerprint')

      expect(typeof md5First).toBe('string')
      expect(md5First).toHaveLength(32) // MD5 hex 长度
      expect(md5First).toBe(md5Second) // 同内容应稳定
    })
  })

  it('isNeedUpdate 在源文件不存在时应抛出明确错误', async () => {
    withTempCwd(() => {
      expect(() => isNeedUpdate('nonexistent', [], os.tmpdir(), 'fingerprint')).toThrow(
        /未找到相应的配置文件/,
      )
    })
  })

  it('isNeedUpdate 文档与规则均未变化时应跳过', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/test.json', '{"hello":"world"}')
      fs.mkdirSync(path.join('generated', 'test'), { recursive: true })

      const md5 = md5Of('{"hello":"world"}')
      const ledger = [
        { name: 'test', md5, configMd5: 'fingerprint', updatedAt: new Date().toISOString() },
      ]

      expect(isNeedUpdate('test', ledger, './generated', 'fingerprint')).toBeUndefined()
    })
  })

  it('isNeedUpdate 文档 MD5 变化时应重新生成', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/test.json', '{"hello":"world"}')
      fs.mkdirSync(path.join('generated', 'test'), { recursive: true })

      const ledger = [
        { name: 'test', md5: 'outdated-md5', configMd5: 'fingerprint', updatedAt: new Date().toISOString() },
      ]

      expect(isNeedUpdate('test', ledger, './generated', 'fingerprint')).toBe(md5Of('{"hello":"world"}'))
    })
  })

  it('isNeedUpdate 旧账本缺少 configMd5 时应重新生成(向后兼容)', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/test.json', '{"hello":"world"}')
      fs.mkdirSync(path.join('generated', 'test'), { recursive: true })

      const ledger = [
        { name: 'test', md5: md5Of('{"hello":"world"}'), updatedAt: new Date().toISOString() },
      ]

      expect(isNeedUpdate('test', ledger, './generated', 'fingerprint')).toBe(md5Of('{"hello":"world"}'))
    })
  })
})

describe('write-config - 生成规则指纹', () => {
  it('同一配置应产生稳定指纹', () => {
    const options = createOptions()
    expect(getConfigFingerprint(options)).toBe(getConfigFingerprint(options))
  })

  it('responseType 变化应改变指纹', () => {
    const base = createOptions({ exportServices: { responseType: 'promise' } })
    const changed = createOptions({ exportServices: { responseType: 'observable' } })

    expect(getConfigFingerprint(base)).not.toBe(getConfigFingerprint(changed))
  })

  it('excludeQueryParams 内容变化应改变指纹', () => {
    const base = createOptions({ exportServices: { excludeQueryParams: ['page'] } })
    const changed = createOptions({ exportServices: { excludeQueryParams: ['page', 'size'] } })

    expect(getConfigFingerprint(base)).not.toBe(getConfigFingerprint(changed))
  })

  it('resolve 函数源码变化应改变指纹', () => {
    const base = createOptions({ exportServices: { serviceResolve: () => 'a' } })
    const changed = createOptions({ exportServices: { serviceResolve: () => 'b' } })

    expect(getConfigFingerprint(base)).not.toBe(getConfigFingerprint(changed))
  })

  it('excludeQueryParams 顺序变化不应改变指纹(等价语义)', () => {
    const a = createOptions({ exportServices: { excludeQueryParams: ['page', 'size', 'order'] } })
    const b = createOptions({ exportServices: { excludeQueryParams: ['order', 'size', 'page'] } })

    expect(getConfigFingerprint(a)).toBe(getConfigFingerprint(b))
  })

  it('forceClear / logger 变化不应改变指纹(不影响产物)', () => {
    const a = createOptions()
    const b = createOptions({ forceClear: true, logger: false })

    expect(getConfigFingerprint(a)).toBe(getConfigFingerprint(b))
  })

  it('application 变化应改变指纹(影响 Service 前缀)', () => {
    const options = createOptions()
    const appA: GenerateApplicationOptions = {
      name: 'a',
      application: 'svc-a',
      input: 'https://gw.example.com/svc-a/v2/api-docs',
      output: 'generated/a',
      exportModels: true,
    }
    const appB = { ...appA, application: 'svc-b' }

    expect(getConfigFingerprint(options, appA)).not.toBe(getConfigFingerprint(options, appB))
  })
})

describe('write-config - 增量规划与账本提交', () => {
  it('planGeneration 应过滤未变化应用并改写本地输入', async () => {
    withTempCwd(() => {
      const options = createOptions()
      const contentA = '{"swagger":"2.0","info":{"title":"a"}}'
      const contentB = '{"swagger":"2.0","info":{"title":"b"}}'

      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync('.request/app-a.json', contentA)
      fs.writeFileSync('.request/app-b.json', contentB)

      const apps: GenerateApplicationOptions[] = [
        {
          name: 'app-a',
          application: 'svc-a',
          input: 'https://gw.example.com/svc-a/v2/api-docs',
          output: 'generated/app-a',
          exportModels: true,
        },
        {
          name: 'app-b',
          application: 'svc-b',
          input: 'https://gw.example.com/svc-b/v2/api-docs',
          output: 'generated/app-b',
          exportModels: true,
        },
      ]

      // app-a: 输出目录存在 + 账本双维指纹完全匹配 → 跳过
      fs.mkdirSync(path.join('generated', 'app-a'), { recursive: true })
      fs.writeFileSync(
        '.request/.config.json',
        JSON.stringify([
          {
            name: 'app-a',
            md5: md5Of(contentA),
            configMd5: getConfigFingerprint(options, apps[0]),
            updatedAt: new Date().toISOString(),
          },
        ]),
      )

      const plan = planGeneration(apps, options)

      expect(plan.pending.map(item => item.name)).toEqual(['app-b'])
      expect(plan.entries.has('app-a')).toBe(false)
      expect(plan.entries.get('app-b')).toEqual({
        md5: md5Of(contentB),
        configMd5: getConfigFingerprint(options, apps[1]),
      })
      // 需要生成的应用输入改写为本地文档路径
      expect(plan.pending[0]?.input).toBe(path.resolve('.request', 'app-b.json'))
      // 跳过的应用输入保持不变
      expect(apps[0]?.input).toBe('https://gw.example.com/svc-a/v2/api-docs')
      // 规划阶段不落盘
      expect(readLocalConfig()).toHaveLength(1)
    })
  })

  it('commitGenerationConfig 应更新已有条目并追加新条目', async () => {
    withTempCwd(() => {
      fs.mkdirSync('.request', { recursive: true })
      fs.writeFileSync(
        '.request/.config.json',
        JSON.stringify([
          { name: 'existing', md5: 'old-md5', updatedAt: '2020-01-01T00:00:00.000Z' },
        ]),
      )

      const entries = new Map()
      entries.set('existing', { md5: 'new-md5', configMd5: 'fingerprint-1' })
      entries.set('fresh', { md5: 'md5-2', configMd5: 'fingerprint-2' })

      commitGenerationConfig(entries)

      const config = readLocalConfig()
      expect(config).toHaveLength(2)

      const existing = config.find(item => item.name === 'existing')
      expect(existing?.md5).toBe('new-md5')
      expect(existing?.configMd5).toBe('fingerprint-1')
      expect(existing?.updatedAt).not.toBe('2020-01-01T00:00:00.000Z')

      const fresh = config.find(item => item.name === 'fresh')
      expect(fresh?.md5).toBe('md5-2')
      expect(fresh?.configMd5).toBe('fingerprint-2')
    })
  })
})
