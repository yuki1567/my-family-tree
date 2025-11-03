import type { Ctx } from '../core/types.js'
import { log, runCommand } from '../core/utils.js'
import { assertWorktreePath } from '../core/validators.js'

export function openVscode(ctx: Ctx) {
  assertWorktreePath(ctx)

  runCommand('code', [ctx.environment.worktreePath])
  log('VS Codeでworktreeを開きました')
}
