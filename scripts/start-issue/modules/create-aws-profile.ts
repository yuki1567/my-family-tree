import { execSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

import { AWS } from '../core/constants.js'
import { AwsProfileConfigError } from '../core/errors.js'
import type {
  AwsProfileConfig,
  CreateAwsProfileOutput,
  SetupEnvironmentOutput,
} from '../core/types.js'
import { log } from '../core/utils.js'

export function createAwsProfile(
  ctx: SetupEnvironmentOutput
): CreateAwsProfileOutput {
  const awsProfileName = `${AWS.PROFILE.PREFIX}-${ctx.gitHub.issueNumber}`

  const configContent = loadAwsConfigContent()

  if (profileAlreadyExists(awsProfileName, configContent)) {
    log(`AWS profile "${awsProfileName}" は既に存在します`)
    return {
      ...ctx,
      environment: {
        ...ctx.environment,
        awsProfileName,
      },
    }
  }

  const referenceProfile = findProfileConfig(AWS.PROFILE.REFERENCE_PROFILE)

  appendProfileToAwsConfig(
    awsProfileName,
    referenceProfile.roleArn,
    referenceProfile.sourceProfile
  )

  log(`AWS profile "${awsProfileName}" を作成しました`)

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      awsProfileName,
    },
  }
}

function loadAwsConfigContent(): string {
  const configPath = getAwsConfigPath()
  if (!existsSync(configPath)) {
    throw new AwsProfileConfigError('', 'config_file')
  }
  return readFileSync(configPath, 'utf-8')
}

function profileAlreadyExists(
  profileName: string,
  configContent: string
): boolean {
  return configContent.includes(`[profile ${profileName}]`)
}

function findProfileConfig(profileName: string): AwsProfileConfig {
  const roleArn = getRoleArn(profileName)
  return { roleArn, sourceProfile: 'default' }
}

function getRoleArn(profile: string): string {
  try {
    const result = execSync(`aws configure get profile.${profile}.role_arn`, {
      encoding: 'utf-8',
    })
    const roleArn = result.trim()

    if (!roleArn) {
      throw new AwsProfileConfigError(profile, 'role_arn')
    }

    return roleArn
  } catch {
    throw new AwsProfileConfigError(profile, 'role_arn')
  }
}

function appendProfileToAwsConfig(
  profileName: string,
  roleArn: string,
  sourceProfile: string
): void {
  const configPath = getAwsConfigPath()
  const profileLines = [
    '',
    `[profile ${profileName}]`,
    `role_arn = ${roleArn}`,
    `source_profile = ${sourceProfile}`,
    '',
  ]

  appendFileSync(configPath, profileLines.join('\n'), 'utf-8')
}

function getAwsConfigPath(): string {
  return path.join(homedir(), '.aws', 'config')
}
