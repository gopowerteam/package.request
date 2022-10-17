module.exports = {
  '**/*.{ts,tsx}': [
    'eslint --cache --fix --max-warnings=0',
    'prettier --write'
  ],
  '**/*.{js,jsx}': [
    'eslint --cache --fix --max-warnings=0 ',
    'prettier --write'
  ]
}
