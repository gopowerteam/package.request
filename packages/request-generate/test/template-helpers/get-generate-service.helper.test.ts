import { describe, expect, it } from 'vitest'
import { getGenerateServiceClassName } from '../../src/template-helpers/get-generate-service-class-name.helper'
import { getGenerateServiceImportPath } from '../../src/template-helpers/get-generate-service-import-path.helper'

describe('getGenerateServiceClassName', () => {
  it('observable 模式应输出 ObservableGenerateRequestService', () => {
    expect(getGenerateServiceClassName.fn('observable')).toBe('ObservableGenerateRequestService')
  })

  it('promise 模式应输出 GenerateRequestService', () => {
    expect(getGenerateServiceClassName.fn('promise')).toBe('GenerateRequestService')
    expect(getGenerateServiceClassName.fn(undefined)).toBe('GenerateRequestService')
  })
})

describe('getGenerateServiceImportPath', () => {
  it('observable 模式应输出子路径 @gopowerteam/request/observable', () => {
    expect(getGenerateServiceImportPath.fn('observable')).toBe('@gopowerteam/request/observable')
  })

  it('promise 模式应输出主入口 @gopowerteam/request', () => {
    expect(getGenerateServiceImportPath.fn('promise')).toBe('@gopowerteam/request')
    expect(getGenerateServiceImportPath.fn(undefined)).toBe('@gopowerteam/request')
  })
})
