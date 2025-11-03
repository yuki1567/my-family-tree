import path from 'node:path'

import type {
  CreateWorktreeOutput,
  GenerateSlugTitleOutput,
} from '../core/types.js'
import { PROJECT_ROOT, log, runCommand } from '../core/utils.js'

export function createWorktree(
  ctx: GenerateSlugTitleOutput
): CreateWorktreeOutput {
  runCommand('git', ['fetch', 'origin'])
  runCommand('git', ['pull', 'origin', 'main'])

  const branchName = `${ctx.gitHub.issueLabel}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)

  runCommand('git', ['worktree', 'add', worktreePath, '-b', branchName, 'main'])
  log(`Worktreeを作成しました: ${worktreePath}`)

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
