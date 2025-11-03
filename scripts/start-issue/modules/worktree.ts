import path from 'node:path'

import type { Ctx } from '../core/types.js'
import { PROJECT_ROOT, log, runCommand } from '../core/utils.js'
import {
  assertIssueLabel,
  assertIssueNumber,
  assertIssueSlugTitle,
} from '../core/validators.js'

export function createWorktree(ctx: Ctx): Ctx {
  assertIssueLabel(ctx)
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)

  runCommand('git', ['fetch', 'origin'])
  runCommand('git', ['pull', 'origin', 'main'])

  const branchName = `${ctx.gitHub.issueLabel}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)

  runCommand('git', ['worktree', 'add', worktreePath, '-b', branchName, 'main'])
  log(`🛠 Worktreeを作成しました: ${worktreePath}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      branchName,
    },
    environment: {
      ...ctx.environment,
      worktreePath,
    },
  }
}
