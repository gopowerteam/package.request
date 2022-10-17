module.exports = {
  '!(**/*.spec.*)**/*.{ts,tsx}': [
    'eslint --cache --fix --max-warnings=0',
    'prettier --write'
  ],
  '!(**/*.spec.*)**/*.{js,jsx}': [
    'eslint --cache --fix --max-warnings=0 ',
    'prettier --write'
  ]
}
