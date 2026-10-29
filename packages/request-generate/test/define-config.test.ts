import { describe, expect, it } from 'vitest'
import { defineConfig } from '../src/define-config'

describe('define-config defineConfig', () => {
  it('原样返回传入的配置对象(同一引用)', () => {
    const config = {
      gateway: 'https://gateway.example.com',
      openapi: 'https://gateway.example.com/docs',
      output: 'generated',
      exportModels: true,
    }

    expect(defineConfig(config)).toBe(config)
  })

  it('返回值与原对象共享引用(透传语义)', () => {
    const config = {
      gateway: 'a',
      openapi: 'b',
      output: 'c',
      exportModels: false,
    }
    const result = defineConfig(config)

    result.gateway = 'changed'

    expect(config.gateway).toBe('changed')
  })
})
