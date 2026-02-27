import antfu from '@antfu/eslint-config'

export default antfu({
  markdown: false,
  ignores: [
    'node_modules/',
    'components/test/*',
    'components/test/*/**',
    'es/',
    'lib/',
    '_site/',
    'dist/',
    '!.cz-config.js',
    '!.lintstagedrc.js',
    '!.babelrc.js',
    '!.request-generate.config.js',
    '**/bin/',
  ],
})
