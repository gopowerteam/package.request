import fs from 'fs-extra'
import type { Options } from 'tsup'

export default <Options>{
  entry: ['src/index.ts', 'src/vite-plugin/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  treeShaking: true,
  platform: 'node',
  target: 'node16',
  external: [
    'rxjs',
    'axios',
    'handlebars',
    '@apidevtools/swagger-parser',
    'vite',
  ],
  shims: true,
  onSuccess() {
    return fs.copy('./src/templates', './dist/templates', {
      overwrite: true,
    })
  },
}
