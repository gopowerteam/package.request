import type { Options } from 'tsup'

export default <Options>{
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  splitting: true,
  clean: true,
  treeShaking: true,
  platform: 'node',
  target: 'node16',
  external: ['rxjs', 'axios', '@apidevtools/swagger-parser'],
  shims: true
}
