import type { GenerateOptions } from '../../src/types/generate-options'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateServiceOptions } from '../../src/utils/get-services-options'

describe('generateServiceOptions - 选项透传', () => {
  const baseOptions: GenerateOptions = {
    gateway: 'https://gateway.example.com',
    openapi: '/v3/api-docs',
    output: './src/http',
    exportModels: true,
  }

  describe('单应用(默认)路径', () => {
    it('未配置 forceClear 时,应用选项的 forceClear 应为 undefined', () => {
      const [app] = generateServiceOptions(baseOptions)

      expect(app.name).toBe('default')
      expect(app.forceClear).toBeUndefined()
    })

    it('配置 forceClear=true 时,应透传到应用选项', () => {
      const [app] = generateServiceOptions({ ...baseOptions, forceClear: true })

      expect(app.forceClear).toBe(true)
    })
  })

  describe('多应用(applications)路径', () => {
    const multiOptions: GenerateOptions = {
      ...baseOptions,
      applications: {
        'dso-service': { key: 'dso-org-service', openapi: '/v3/api-docs' },
        'mall-service': { key: 'xbt-mall', openapi: '/v2/api-docs' },
      },
    }

    it('baseDir 显式声明时 output 与 baseDir 均按其解析(monorepo 场景)', () => {
      const baseDir = '/repo/root'
      const apps = generateServiceOptions({
        ...baseOptions,
        baseDir,
        applications: { 'app-a': 'key-a' },
      })

      expect(apps[0].baseDir).toBe(baseDir)
      // 相对 output 以 baseDir 为基准,而非 process.cwd()
      expect(apps[0].output).toBe(path.resolve(baseDir, 'src/http/app-a'))
    })

    it('每个应用选项都应透传 forceClear=true', () => {
      const apps = generateServiceOptions({ ...multiOptions, forceClear: true })

      expect(apps).toHaveLength(2)
      for (const app of apps) {
        // 关键回归断言:forceClear 必须从全局配置透传到每个应用
        expect(app.forceClear).toBe(true)
      }
    })

    it('未配置 forceClear 时,所有应用选项的 forceClear 应为 undefined', () => {
      const apps = generateServiceOptions(multiOptions)

      for (const app of apps) {
        expect(app.forceClear).toBeUndefined()
      }
    })

    it('应正确拼接每个应用的 output 子目录', () => {
      const apps = generateServiceOptions(multiOptions)
      const outputs = apps.map(app => app.output)

      // output 单点收敛为绝对路径(按 baseDir ?? cwd 解析),并保留应用子目录
      expect(outputs).toContain(path.resolve('src/http/dso-service'))
      expect(outputs).toContain(path.resolve('src/http/mall-service'))
    })

    it('字符串形式的应用配置也应透传 forceClear', () => {
      const apps = generateServiceOptions({
        ...baseOptions,
        forceClear: true,
        applications: {
          'simple-service': 'simple-app-key',
        },
      })

      expect(apps).toHaveLength(1)
      expect(apps[0].forceClear).toBe(true)
    })
  })
})
