import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/adapters/index.ts',
    'src/plugins/index.ts',
    'src/observable/generate-request-service.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['axios', 'rxjs'],
  },
})
