import antfu from '@antfu/eslint-config'

export default antfu({
  markdown: false,
  ignores: [
    'node_modules/',
    '**/*.spec.*',
    '**/style/',
    '*.html',
    'components/test/*',
    'components/test/*/**',
    'es/',
    'lib/',
    '_site/',
    'dist/',
    'bin/index.js',
    '!.cz-config.js',
    '!.lintstagedrc.js',
    '!.babelrc.js',
    '!.request-generate.config.js',
    '**/bin/',
  ],
})
