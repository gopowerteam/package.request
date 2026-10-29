import type { GenerateClient } from '../../src/types/generate-client'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { Field } from '../../src/entities/field'
import { Model } from '../../src/entities/model'
import { writeModels } from '../../src/generate/write-models'
import { registerHandlebarTemplates } from '../../src/template'

function buildField(name: string, type: string, required = false): Field {
  const field = new Field(name, required)
  field.type = type
  return field
}

function buildClient(): GenerateClient {
  const user = new Model('User')
  user.fields = [buildField('id', 'string', true), buildField('name', 'string')]

  const order = new Model('Order')
  order.fields = [buildField('amount', 'number')]

  return { models: [user, order], services: [] }
}

/**
 * 在临时目录中执行用例(结束后恢复 cwd 并清理)
 */
function withTempCwd(fn: () => void) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))
  const cwd = process.cwd()
  process.chdir(tmpDir)

  try {
    fn()
  }
  finally {
    process.chdir(cwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

describe('writeModels - 写入模型文件', () => {
  beforeEach(() => {
    registerHandlebarTemplates()
  })

  it('exportModels=false 时不应创建任何目录', () => {
    writeModels(buildClient(), { output: 'should-not-exist', exportModels: false, input: '' })

    expect(fs.existsSync('should-not-exist')).toBe(false)
  })

  it('client.models 缺失时应直接返回', () => {
    writeModels({ services: [] } as unknown as GenerateClient, {
      output: 'should-not-exist',
      exportModels: true,
      input: '',
    })

    expect(fs.existsSync('should-not-exist')).toBe(false)
  })

  it('应将所有模型写入 <output>/models 并打上 .generated 标记', () => {
    withTempCwd(() => {
      writeModels(buildClient(), { output: '.', exportModels: true, input: '' })

      expect(fs.existsSync(path.join('models', 'User.ts'))).toBe(true)
      expect(fs.existsSync(path.join('models', 'Order.ts'))).toBe(true)
      expect(fs.existsSync(path.join('models', '.generated'))).toBe(true)

      const content = fs.readFileSync(path.join('models', 'User.ts'), 'utf-8')
      expect(content).toContain('export type User = {')
      expect(content).toContain('id')
    })
  })

  it('目标目录已存在且无标记时应拒绝写入并保留原文件', () => {
    withTempCwd(() => {
      fs.mkdirSync('models', { recursive: true })
      fs.writeFileSync(path.join('models', 'user-file.txt'), 'user data')

      expect(() =>
        writeModels(buildClient(), { output: '.', exportModels: true, input: '' }),
      ).toThrow(/目标目录已存在且非生成产物/)

      // 用户已有文件不应被破坏
      expect(fs.readFileSync(path.join('models', 'user-file.txt'), 'utf-8')).toBe('user data')
    })
  })

  it('forceClear=true 时应清空旧产物后重写', () => {
    withTempCwd(() => {
      fs.mkdirSync('models', { recursive: true })
      fs.writeFileSync(path.join('models', 'Stale.ts'), 'old content')

      writeModels(buildClient(), { output: '.', exportModels: true, forceClear: true, input: '' })

      expect(fs.existsSync(path.join('models', 'Stale.ts'))).toBe(false)
      expect(fs.existsSync(path.join('models', 'User.ts'))).toBe(true)
      expect(fs.existsSync(path.join('models', '.generated'))).toBe(true)
    })
  })

  it('output 在 cwd 之外时应抛出安全守卫错误', () => {
    expect(() =>
      writeModels(buildClient(), {
        output: path.join(os.tmpdir(), 'rg-outside-models'),
        exportModels: true,
        input: '',
      }),
    ).toThrow(/输出路径必须在项目目录内/)
  })
})
