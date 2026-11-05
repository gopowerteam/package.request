import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '@gopowerteam/request',
  description:
    '适配器模式 HTTP 请求库与 OpenAPI 代码生成工具链 —— 类型安全、可扩展、跨运行时',
  bundler: viteBundler({
    // vite 8 默认 lightningcss 严格压缩会把主题样式的 var(var()) 瑕疵判为错误
    // 文档站换用 esbuild 压缩器,规避该误报
    viteOptions: {
      build: {
        cssMinify: 'esbuild',
      },
    },
  }),
  theme: defaultTheme({
    logo: null,
    navbar: [
      { text: '指南', link: '/guide/introduction.md' },
      { text: '代码生成', link: '/generate/getting-started.md' },
      { text: '示例', link: '/examples/basic-crud.md' },
      {
        text: 'npm',
        children: [
          { text: '@gopowerteam/request', link: 'https://www.npmjs.com/package/@gopowerteam/request' },
          { text: '@gopowerteam/request-generate', link: 'https://www.npmjs.com/package/@gopowerteam/request-generate' },
        ],
      },
      {
        text: 'GitHub',
        link: 'https://github.com/gopowerteam/package.request',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          children: [
            '/guide/introduction.md',
            '/guide/getting-started.md',
            '/guide/request.md',
            '/guide/plugins.md',
            '/guide/observable.md',
          ],
        },
      ],
      '/generate/': [
        {
          text: '代码生成',
          children: [
            '/generate/getting-started.md',
            '/generate/cli-vite.md',
            '/generate/openapi-31.md',
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          children: [
            '/examples/basic-crud.md',
            '/examples/cancel-request.md',
          ],
        },
      ],
    },
  }),
})
