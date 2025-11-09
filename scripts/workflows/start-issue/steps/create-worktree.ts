import path from 'node:path'

import { createWorktree as gitCreateWorktree } from '../../lib/git.js'
import type {
  CreateWorktreeContext,
  GenerateSlugTitleContext,
} from '../../shared/types.js'
import { PROJECT_ROOT } from '../../shared/utils.js'

export function createWorktree(
  ctx: GenerateSlugTitleContext
): CreateWorktreeContext {
  const branchName = `${ctx.gitHub.issueLabel}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(
    PROJECT_ROOT,
    '..',
    ctx.gitHub.issueLabel,
    `${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  )

  gitCreateWorktree(branchName, worktreePath)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      branchName,
    },
    environment: {
      worktreePath,
      dbAdminUser: ctx.database.adminUser,
      dbAdminPassword: ctx.database.adminPassword,
      dbUser: ctx.database.user,
      dbUserPassword: ctx.database.userPassword,
    },
  }
}
