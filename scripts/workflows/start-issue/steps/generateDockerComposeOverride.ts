import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { WorktreeConfig } from 'scripts/workflows/shared/types.js'
import { PROJECT_ROOT } from 'scripts/workflows/shared/utils.js'

export function generateDockerComposeOverride(
  worktreeConfig: WorktreeConfig
): void {
  const templatePath = path.join(
    PROJECT_ROOT,
    'docker-compose.override.yml.example'
  )
  const template = readFileSync(templatePath, 'utf-8')

  const content = template
    .replace(/"3000:3000"/g, `"${worktreeConfig.webPort}:3000"`)
    .replace(/"4000:4000"/g, `"${worktreeConfig.apiPort}:4000"`)

  const outputPath = path.join(
    worktreeConfig.worktreePath,
    'docker-compose.override.yml'
  )
  writeFileSync(outputPath, content, 'utf-8')
}
