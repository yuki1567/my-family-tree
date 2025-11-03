export const CONFIG = {
  ports: {
    webBase: 3000,
    apiBase: 4000,
  },
  database: {
    namePrefix: 'family_tree_',
    maxSlugLength: 50,
  },
  aws: {
    parameterPath: {
      development: '/family-tree/development',
      worktreePrefix: '/family-tree/worktree',
    },
  },
  files: {
    claudeLocalSettings: {
      src: '.claude/settings.local.json',
    },
    prompt: {
      template: '.claude/templates/worktree-prompt.md',
      output: '.claude/tmp/generated-worktree-prompt.md',
    },
  },
  docker: {
    dbService: 'db',
    dbAdminUser: 'admin_user',
    dbDefaultDatabase: 'postgres',
  },
} as const
