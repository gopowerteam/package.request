import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite-plugin/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node16',
  deps: {
    neverBundle: [
      'rxjs',
      'axios',
      'handlebars',
      '@apidevtools/swagger-parser',
      'vite',
    ],
  },
  shims: true,
  copy: { from: 'src/templates', to: 'dist/templates' },
})
