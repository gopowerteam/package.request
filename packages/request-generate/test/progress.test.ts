import type { MockInstance } from 'vitest'
import ora from 'ora'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearDownloadResults,
  clearResults,
  collectDownloadResult,
  collectResult,
  formatDuration,
  formatSize,
  outputDownloadSummary,
  outputSummary,
  printPhaseBanner,
  renderTable,
  startSpinner,
  stopSpinner,
} from '../src/progress'

const oraState = vi.hoisted(() => {
  const instances: Array<{ stop: ReturnType<typeof vi.fn> }> = []
  const oraMock = vi.fn(() => {
    const instance = { stop: vi.fn() }
    instances.push(instance)
    return { start: vi.fn(() => instance) }
  })
  return { instances, oraMock }
})

vi.mock('ora', () => ({ default: oraState.oraMock }))

function capturedOutput(logSpy: MockInstance): string {
  return logSpy.mock.calls.map(args => args.map(String).join('')).join('\n')
}

describe('progress formatSize', () => {
  it('小于 1KB 以 B 输出', () => {
    expect(formatSize(0)).toBe('0 B')
    expect(formatSize(512)).toBe('512 B')
  })

  it('1024 边界进入 KB 分支', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  it('1024 * 1024 边界进入 MB 分支', () => {
    expect(formatSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('progress formatDuration', () => {
  it('小于 1s 以 ms 输出', () => {
    expect(formatDuration(0)).toBe('0 ms')
    expect(formatDuration(999)).toBe('999 ms')
  })

  it('1s 到 1min 之间以 s 输出', () => {
    expect(formatDuration(1000)).toBe('1.0 s')
    expect(formatDuration(59_000)).toBe('59.0 s')
  })

  it('达到 1min 后以 min 输出', () => {
    expect(formatDuration(60_000)).toBe('1.0 min')
    expect(formatDuration(90_000)).toBe('1.5 min')
  })
})

describe('progress printPhaseBanner', () => {
  let logSpy: MockInstance

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('输出阶段横幅文本', () => {
    printPhaseBanner('开始生成接口代码：')
    expect(capturedOutput(logSpy)).toContain('开始生成接口代码：')
  })
})

describe('progress renderTable', () => {
  it('渲染表头与数据行', () => {
    const output = renderTable(['Name', 'Count'], [['a', '1'], ['b', '2']])

    expect(output).toContain('Name')
    expect(output).toContain('a')
    expect(output).toContain('2')
  })

  it('支持汇总行与列对齐配置', () => {
    const output = renderTable(
      ['Name', 'Count'],
      [['a', '1']],
      ['Total', '1'],
      ['left', 'right'],
    )

    expect(output).toContain('Total')
    expect(output).toContain('a')
  })
})

describe('progress spinner', () => {
  beforeEach(() => {
    stopSpinner()
    oraState.instances.length = 0
    vi.mocked(ora).mockClear()
  })

  it('startSpinner 以指定文案启动 spinner', () => {
    startSpinner('生成中...')

    expect(vi.mocked(ora)).toHaveBeenCalledWith('生成中...')
    expect(oraState.instances.length).toBe(1)
  })

  it('startSpinner 默认文案为 处理中...', () => {
    startSpinner()

    expect(vi.mocked(ora)).toHaveBeenLastCalledWith('处理中...')
    stopSpinner()
  })

  it('stopSpinner 停止当前 spinner', () => {
    startSpinner('加载中')
    const instance = oraState.instances[oraState.instances.length - 1]

    stopSpinner()

    expect(instance?.stop).toHaveBeenCalledTimes(1)
  })

  it('重复 stopSpinner 只停止一次且不抛错', () => {
    startSpinner()
    const instance = oraState.instances[oraState.instances.length - 1]

    expect(() => {
      stopSpinner()
      stopSpinner()
    }).not.toThrow()

    expect(instance?.stop).toHaveBeenCalledTimes(1)
  })

  it('未启动时 stopSpinner 安全无副作用', () => {
    expect(() => stopSpinner()).not.toThrow()
    expect(oraState.instances.length).toBe(0)
  })
})

describe('progress 生成阶段汇总', () => {
  let logSpy: MockInstance

  beforeEach(() => {
    clearResults()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('空结果输出 (none) 占位行', () => {
    outputSummary()

    const output = capturedOutput(logSpy)
    expect(output).toContain('(none)')
    expect(output).not.toContain('Total')
  })

  it('收集结果后输出明细与 Total 汇总', () => {
    collectResult('mall-service', 12, 3)
    collectResult('user-service', 5, 2)

    outputSummary()

    const output = capturedOutput(logSpy)
    expect(output).toContain('mall-service')
    expect(output).toContain('user-service')
    expect(output).toContain('17')
    expect(output).toContain('Total')
    expect(output).toContain('2 services')
  })

  it('clearResults 清空已收集结果', () => {
    collectResult('x-service', 1, 1)
    clearResults()

    outputSummary()

    expect(capturedOutput(logSpy)).toContain('(none)')
  })
})

describe('progress 下载阶段汇总', () => {
  let logSpy: MockInstance

  beforeEach(() => {
    clearDownloadResults()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('空结果输出 (none) 占位行', () => {
    outputDownloadSummary()

    expect(capturedOutput(logSpy)).toContain('(none)')
  })

  it('成功项输出大小、耗时与汇总', () => {
    collectDownloadResult('svc-a', 2048, 1500)

    outputDownloadSummary(30_000)

    const output = capturedOutput(logSpy)
    expect(output).toContain('svc-a')
    expect(output).toContain('2.0 KB')
    expect(output).toContain('1.5 s')
    expect(output).toContain('30.0 s')
    expect(output).toContain('1 services')
  })

  it('失败项(size 为 null)标记 ✗ 且汇总显示 0/1 ok', () => {
    collectDownloadResult('svc-b', null, null)

    outputDownloadSummary()

    const output = capturedOutput(logSpy)
    expect(output).toContain('✗')
    expect(output).toContain('0/1 ok')
    expect(output).toContain('0 B')
  })

  it('混合结果汇总显示 1/2 ok', () => {
    collectDownloadResult('svc-a', 1024, 100)
    collectDownloadResult('svc-b', null, null)

    outputDownloadSummary()

    const output = capturedOutput(logSpy)
    expect(output).toContain('1/2 ok')
    expect(output).not.toContain('2 services')
  })

  it('未传总耗时时汇总时间列使用占位符', () => {
    collectDownloadResult('svc-a', 1024, 100)

    outputDownloadSummary()

    const output = capturedOutput(logSpy)
    const totalLine = output.split('\n').find(line => line.includes('Total'))

    expect(totalLine).toBeTruthy()
    expect(totalLine).toContain('-')
    // 时间单元格为 '-' 占位,而非格式化时长(如 '1.5 s')
    expect(totalLine).toMatch(/│\s+-\s+│/)
    expect(totalLine).not.toMatch(/\d+\.\d s/)
  })

  it('clearDownloadResults 清空已收集结果', () => {
    collectDownloadResult('svc-a', 1024, 100)
    clearDownloadResults()

    outputDownloadSummary()

    expect(capturedOutput(logSpy)).toContain('(none)')
  })
})
