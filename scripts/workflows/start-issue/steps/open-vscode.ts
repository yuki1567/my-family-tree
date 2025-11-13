import { exec } from 'node:child_process'

import { updateIssueStatus } from '../../lib/GitHubApi.js'
import type { CreateAwsProfileContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function openVscode(ctx: CreateAwsProfileContext): Promise<void> {
  await updateIssueStatus(
    ctx.githubProjects.projectId,
    ctx.githubProjects.projectItemId,
    ctx.githubProjects.statusFieldId,
    ctx.githubProjects.inProgressStatusId
  )

  log('VSCodeを起動中...')
  exec(`code "${ctx.environment.worktreePath}"`)
  log(`✅ Issue #${ctx.gitHub.issueNumber} の開発環境セットアップ完了`)
}
