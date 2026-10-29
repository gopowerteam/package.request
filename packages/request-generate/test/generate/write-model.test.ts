import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { Field } from '../../src/entities/field'
import { Model } from '../../src/entities/model'
import { writeModel } from '../../src/generate/write-model'
import { registerHandlebarTemplates } from '../../src/template'

function buildField(name: string, type: string, required = false): Field {
  const field = new Field(name, required)
  field.type = type
  return field
}

describe('writeModel - 单个模型写入', () => {
  beforeEach(() => {
    registerHandlebarTemplates()
  })

  it('应按模板渲染模型并写入目标文件', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))

    try {
      const model = new Model('User')
      model.imports = ['Profile']
      model.fields = [
        buildField('id', 'string', true),
        buildField('profile', 'Profile'),
      ]

      const output = path.join(tmpDir, 'User.ts')
      writeModel(model, output)

      const content = fs.readFileSync(output, 'utf-8')
      expect(content).toContain('export type User = {')
      expect(content).toContain('id')
      expect(content).toContain('profile')
      // imports 渲染为相对类型导入
      expect(content).toContain('import type { Profile } from \'./Profile\';')
    }
    finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('重复写入同一路径时应覆盖为最新内容', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rg-test-'))

    try {
      const user = new Model('User')
      user.fields = [buildField('id', 'string', true)]

      const order = new Model('Order')
      order.fields = [buildField('amount', 'number')]

      const output = path.join(tmpDir, 'Model.ts')
      writeModel(user, output)
      writeModel(order, output)

      const content = fs.readFileSync(output, 'utf-8')
      expect(content).toContain('export type Order = {')
      expect(content).not.toContain('User')
    }
    finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
