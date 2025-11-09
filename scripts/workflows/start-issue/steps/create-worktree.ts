import path from 'node:path'

import { createWorktree as gitCreateWorktree } from '../../lib/git.js'
import { PROJECT_ROOT } from '../../shared/utils.js'

import type { GenerateSlugTitleOutput } from './generate-slug-title.js'

export type CreateWorktreeOutput = GenerateSlugTitleOutput & {
  gitHub: GenerateSlugTitleOutput['gitHub'] & {
    branchName: string
  }
  environment: GenerateSlugTitleOutput['environment'] & {
    worktreePath: string
  }
}

export function createWorktree(
  ctx: GenerateSlugTitleOutput
): CreateWorktreeOutput {
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
      ...ctx.environment,
      worktreePath,
    },
  }
}
