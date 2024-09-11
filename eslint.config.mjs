import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ["node_modules/","**/node_modules/**/","**/*.spec.*","**/style/","*.html","**/*.html/**","components/test/*","components/test/*/**","es/","**/es/**/","lib/","**/lib/**/","_site/","**/_site/**/","dist/","**/dist/**/","dist","**/dist/**","!.cz-config.js","!**/.cz-config.js/**","!.lintstagedrc.js","!**/.lintstagedrc.js/**","!.babelrc.js","!**/.babelrc.js/**","!.request-generate.config.js","!**/.request-generate.config.js/**","bin/index.js","bin/index.js/**"],
})
