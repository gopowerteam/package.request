module.exports = {
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    // 基础规则引入
    'eslint:recommended',
    // React规则引入
    // 'plugin:react/recommended',
    // prettier规则引入&处理perttier-eslint冲突
    'plugin:prettier/recommended'
  ],
  overrides: [
    {
      files: ['**/*.{js,jsx}'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        allowImportExportEverywhere: false,
        ecmaFeatures: {
          globalReturn: false
        }
      }
    },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        // typescript支持引入
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': ['off']
      }
    }
  ]
}
