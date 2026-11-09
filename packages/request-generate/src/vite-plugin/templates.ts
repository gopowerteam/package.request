const useRequestFunctionCodeTemplate = `
export function useRequest(
  ...selects
) {
  const services = selects.map((select)=>{
    const service = select(serviceMap)
    return new service()
  })

  if(services.length === 1){
    return services[0]
  }else{
    return services
  }
}
`

const useRequestFunctionTypeTemplate = `
export function useRequest<T1,T2,T3,T4,T5,T6>(
  select1: ((services: typeof serviceMap) => { new (): T1 }),
  select2: ((services: typeof serviceMap) => { new (): T2 }),
  select3: ((services: typeof serviceMap) => { new (): T3 }),
  select4: ((services: typeof serviceMap) => { new (): T4 }),
  select5: ((services: typeof serviceMap) => { new (): T5 }),
  select6: ((services: typeof serviceMap) => { new (): T6 }),
): [T1,T2,T3,T4,T5,T6]
export function useRequest<T1,T2,T3,T4,T5>(
  select1: ((services: typeof serviceMap) => { new (): T1 }),
  select2: ((services: typeof serviceMap) => { new (): T2 }),
  select3: ((services: typeof serviceMap) => { new (): T3 }),
  select4: ((services: typeof serviceMap) => { new (): T4 }),
  select5: ((services: typeof serviceMap) => { new (): T5 }),
): [T1,T2,T3,T4,T5]
export function useRequest<T1,T2,T3,T4>(
  select1: ((services: typeof serviceMap) => { new (): T1 }),
  select2: ((services: typeof serviceMap) => { new (): T2 }),
  select3: ((services: typeof serviceMap) => { new (): T3 }),
  select4: ((services: typeof serviceMap) => { new (): T4 }),
): [T1,T2,T3,T4]
export function useRequest<T1,T2,T3>(
  select1: ((services: typeof serviceMap) => { new (): T1 }),
  select2: ((services: typeof serviceMap) => { new (): T2 }),
  select3: ((services: typeof serviceMap) => { new (): T3 }),
): [T1,T2,T3]
export function useRequest<T1,T2>(
  select1: ((services: typeof serviceMap) => { new (): T1 }),
  select2: ((services: typeof serviceMap) => { new (): T2 }),
): [T1,T2]
export function useRequest<T>(
  select: ((services: typeof serviceMap) => { new (): T })
): T
export function useRequest<T>(
  ...selects: ((services: typeof serviceMap) => { new (): T })[]
): T | T[]
`

const importServiceTemplate = `
{{#if groups}}
{{#each groups}}
{{#each services}}
import { {{{name}}} as {{group}}_{{name}} } from '{{path}}'
{{/each}}
{{/each}}
{{/if}}
{{#if flatServices}}
{{#each flatServices}}
import { {{{name}}} } from '{{path}}'
{{/each}}
{{/if}}
`

const defineServiceMapTemplate = `
const serviceMap = {
  {{#if groups}}
  {{#each groups}}
  {{{name}}}: {
    {{#each services}}
    {{{name}}}: {{group}}_{{name}},
    {{/each}}
  },
  {{/each}}
  {{/if}}
  {{#if flatServices}}
  {{#each flatServices}}
  {{{name}}},
  {{/each}}
  {{/if}}
}
`

export const generateCodeTemplate = `
${importServiceTemplate.trim()}

${defineServiceMapTemplate.trim()}

${useRequestFunctionCodeTemplate.trim()}
`

export const generateDeclareTemplate = `declare module '{{{MODULE_ID}}}' {
  ${importServiceTemplate.trim()}

  ${defineServiceMapTemplate.trim()}

  ${useRequestFunctionTypeTemplate.trim()}
}
`

/**
 * 降级模式代码(throwOnError: false):虚拟模块可加载,
 * useRequest 调用时抛出带原因的明确运行时错误
 */
export function generateDegradedTemplate(reason: unknown): string {
  // 还原被包装错误的 cause 链(如 'request-generate 接口生成失败' 包装的原始下载/解析错误)
  const describe = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return String(error)
    }
    const cause = error.cause instanceof Error
      ? ` (原因: ${describe(error.cause)})`
      : ''
    return `${error.message}${cause}`
  }

  const message = JSON.stringify(
    `[request-generate] 接口未生成(降级模式),请在 dev server 启动日志中查看原因: ${describe(reason)}`,
  )

  return `export function useRequest() {
  throw new Error(${message})
}
`
}
