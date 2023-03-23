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
{{else}}
{{#each services}}
import { {{{name}}} } from '{{path}}'
{{/each}}
{{/if}}
`

const defineServiceMapTemplate = `
{{#if groups}}
const serviceMap = {
  {{#each groups}}
  {{{name}}}: {
    {{#each services}}
    {{{name}}}: {{group}}_{{name}},
    {{/each}}
  },
  {{/each}}
}
{{else}}
const serviceMap = {
{{#each services}}
  {{{name}}},
{{/each}}
}
{{/if}}
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
