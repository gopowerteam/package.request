import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'vite-plugin/index': 'src/vite-plugin/index.ts',
    'generate': 'bin/generate.mts',
    'download': 'bin/download.mts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node16',
  deps: {
    neverBundle: [
      'axios',
      'handlebars',
      '@apidevtools/swagger-parser',
      'tsx',
      'vite',
    ],
  },
  copy: {
    from: 'src/templates',
    to: 'dist/',
    flatten: false,
  },
})
