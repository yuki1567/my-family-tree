import type { CreateAwsProfileOutput } from '../core/types.js'
import { log, runCommand } from '../core/utils.js'

export function openVscode(ctx: CreateAwsProfileOutput): void {
  runCommand('code', [ctx.environment.worktreePath])
  log('VS Codeでworktreeを開きました')
}
