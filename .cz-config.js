module.exports = {
  types: [
    {
      value: 'feat',
      name: '✨ 功能:     提交新增功能'
    },
    {
      value: 'fix',
      name: '🐛 修复:     提交问题修复'
    },
    {
      value: 'docs',
      name: '📖 文档:     提交文档更新'
    },
    {
      value: 'refactor',
      name: '📦 重构:     提交代码重构'
    },
    {
      value: 'perf',
      name: '🚀 性能:     优化代码性能'
    },
    {
      value: 'test',
      name: '🚨 测试:     提交相关测试'
    },
    {
      value: 'build',
      name: '👷 构建:     更新构建逻辑'
    },
    {
      value: 'revert',
      name: '🔙 回滚:     进行代码回滚'
    }
  ],
  messages: {
    type: '选择本次提交代码的类型:\n',
    customScope: '请选择本次提交影响的范围(可选):\n',
    scope: '请选择本次提交影响的范围(可选):\n',
    subject: '请输入提交代码的目的:\n',
    body: '请输入修改的详细内容(可选):\n',
    breaking: '请填写破坏性更新描述(可选):\n',
    footer: '本地提交针对的ISSUE(可选):\n',
    confirmCommit: '请确认以上内容'
  },
  allowBreakingChanges: ['feat', 'fix', 'refactor', 'perf', 'build', 'revert']
}
