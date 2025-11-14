import { WorkflowContext } from 'scripts/workflows/shared/types.js'

export async function cleanupParameters(ctx: WorkflowContext): Promise<void> {
  await ctx.parameterStore.deleteParameters()
}
