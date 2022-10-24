const useRequestFunctionCodeTemplate = `
export function useRequest(
  select
) {
  const service = select(serviceMap)
  return new service()
}
`

const useRequestFunctionTypeTemplate = `
export function useRequest<T>(
  select: (services: typeof serviceMap) => { new (): T }
): T
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
