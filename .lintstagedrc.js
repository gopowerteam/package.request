module.exports = {
  '!(**/*.spec.*)**/*.{ts,tsx}': [
    'eslint --cache --fix',
  ],
  '!(**/*.spec.*)**/*.{js,jsx}': [
    'eslint --cache --fix',
  ],
}
