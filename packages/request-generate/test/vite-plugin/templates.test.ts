import Handlebars from 'handlebars'
import { describe, expect, it } from 'vitest'
import { generateCodeTemplate, generateDeclareTemplate } from '../../src/vite-plugin/templates'

describe('vite-plugin templates', () => {
  const services = [
    { name: 'UserService', path: '@/http/services/UserService' },
  ]

  it('generateCodeTemplate 无分组时生成平铺导入与 serviceMap', () => {
    const code = Handlebars.compile(generateCodeTemplate)({ services })

    expect(code).toContain('import { UserService } from \'@/http/services/UserService\'')
    expect(code).toContain('const serviceMap = {')
    expect(code).toContain('UserService,')
    expect(code).toContain('export function useRequest(')
    expect(code).not.toContain('declare module')
  })

  it('generateCodeTemplate 有分组时生成分组别名导入与嵌套 serviceMap', () => {
    const grouped = { name: 'OrderService', group: 'Mall', path: '@/http/mall/OrderService' }
    const code = Handlebars.compile(generateCodeTemplate)({
      groups: [{ name: 'Mall', services: [grouped] }],
      services: [grouped],
    })

    expect(code).toContain('import { OrderService as Mall_OrderService } from \'@/http/mall/OrderService\'')
    expect(code).toContain('Mall: {')
    expect(code).toContain('OrderService: Mall_OrderService,')
  })

  it('generateDeclareTemplate 包裹 declare module 并包含类型重载', () => {
    const code = Handlebars.compile(generateDeclareTemplate)({
      MODULE_ID: 'virtual:request',
      services,
    })

    expect(code).toContain('declare module \'virtual:request\'')
    expect(code).toContain('): [T1,T2]')
    expect(code).toContain('UserService')
    expect(code.trim().endsWith('}')).toBe(true)
  })
})
