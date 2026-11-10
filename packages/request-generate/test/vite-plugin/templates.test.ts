import Handlebars from 'handlebars'
import { describe, expect, it } from 'vitest'
import { generateCodeTemplate, generateDeclareTemplate } from '../../src/vite-plugin/templates'
import { expectNoDuplicates, exportedNames } from './helpers'

describe('vite-plugin templates', () => {
  const flatServices = [
    { name: 'UserService', path: '@/http/services/UserService' },
  ]

  it('generateCodeTemplate 无分组时生成平铺导入与 serviceMap', () => {
    const code = Handlebars.compile(generateCodeTemplate)({ flatServices })

    expect(code).toContain('import { UserService } from \'@/http/services/UserService\'')
    expect(code).toContain('const serviceMap = {')
    expect(code).toContain('UserService,')
    expect(code).toContain('export function useRequest(')
    expect(code).toContain('export { UserService }')
    expect(code).not.toContain('declare module')
  })

  it('generateCodeTemplate 有分组时生成分组别名导入与嵌套 serviceMap', () => {
    const grouped = { name: 'OrderService', group: 'Mall', path: '@/http/mall/OrderService' }
    const code = Handlebars.compile(generateCodeTemplate)({
      groups: [
        {
          name: 'Mall',
          services: [grouped],
        },
      ],
    })

    expect(code).toContain('import { OrderService as Mall_OrderService } from \'@/http/mall/OrderService\'')
    expect(code).toContain('Mall: {')
    expect(code).toContain('OrderService: Mall_OrderService,')
  })

  it('generateCodeTemplate 分组与扁平混合渲染时两者都输出', () => {
    const grouped = { name: 'OrderService', group: 'Mall', path: '@/http/mall/OrderService' }
    const code = Handlebars.compile(generateCodeTemplate)({
      groups: [
        {
          name: 'Mall',
          services: [grouped],
        },
      ],
      flatServices,
    })

    expect(code).toContain('OrderService as Mall_OrderService')
    expect(code).toContain('import { UserService } from')
    expect(code).toContain('UserService,')
  })

  it('generateDeclareTemplate 包裹 declare module 并包含类型重载', () => {
    const code = Handlebars.compile(generateDeclareTemplate)({
      MODULE_ID: 'virtual:request',
      flatServices,
    })

    expect(code).toContain('declare module \'virtual:request\'')
    expect(code).toContain('): [T1,T2]')
    expect(code).toContain('UserService')
    expect(code).toContain('export { UserService }')
    expect(code.trim().endsWith('}')).toBe(true)
  })

  // #9 回归:分组 Service 的名字以应用为作用域,不存在全局唯一裸名,
  // 扁平再导出(export { DsoService_AuthService as AuthService })会产出重复 export
  it('generateCodeTemplate 分组 Service 不产出顶层扁平再导出(#9)', () => {
    const grouped = { name: 'AuthService', group: 'DsoService', path: '@/dso-service/services/AuthService' }
    const code = Handlebars.compile(generateCodeTemplate)({
      groups: [
        {
          name: 'DsoService',
          services: [grouped],
        },
      ],
    })

    expect(exportedNames(code)).toEqual([])
    // 分组导入别名与 serviceMap 不受影响(useRequest 路径保持完整)
    expect(code).toContain('import { AuthService as DsoService_AuthService }')
    expect(code).toContain('AuthService: DsoService_AuthService,')
  })

  // 0.5.1 的第二个活漏洞:扁平与分组同名时产出两条同名 export(解析失败)
  it('generateCodeTemplate 分组与扁平同名时只导出扁平名(#9 混合同名场景)', () => {
    const grouped = { name: 'UserService', group: 'Mall', path: '@/http/mall/UserService' }
    const code = Handlebars.compile(generateCodeTemplate)({
      groups: [
        {
          name: 'Mall',
          services: [grouped],
        },
      ],
      flatServices,
    })

    expect(exportedNames(code)).toEqual(['UserService'])
    expectNoDuplicates(exportedNames(code))
  })

  // runtime 与 .d.ts 共用同一模板 → 导出面恒等,skipLibCheck 下不再分叉
  it('generateDeclareTemplate 与 generateCodeTemplate 的导出面一致', () => {
    const data = {
      MODULE_ID: 'virtual:request',
      groups: [
        {
          name: 'DsoService',
          services: [
            { name: 'AuthService', group: 'DsoService', path: '@/dso-service/services/AuthService' },
          ],
        },
      ],
      flatServices,
    }
    const code = Handlebars.compile(generateCodeTemplate)(data)
    const declare = Handlebars.compile(generateDeclareTemplate)(data)

    expect(exportedNames(declare)).toEqual(exportedNames(code))
    expectNoDuplicates(exportedNames(code))
  })
})
