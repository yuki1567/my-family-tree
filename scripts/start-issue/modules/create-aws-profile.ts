import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

import { AWS } from '../core/constants.js'
import type {
  AwsProfileConfig,
  CreateAwsProfileOutput,
  SetupEnvironmentOutput,
} from '../core/types.js'
import { log } from '../core/utils.js'

export function createAwsProfile(
  ctx: SetupEnvironmentOutput
): CreateAwsProfileOutput {
  const profileName = `${AWS.PROFILE.PREFIX}-${ctx.gitHub.issueNumber}`

  if (profileAlreadyExists(profileName)) {
    log(`AWS profile "${profileName}" は既に存在します`)
    return {
      ...ctx,
      environment: {
        ...ctx.environment,
        awsProfileName: profileName,
      },
    }
  }

  const referenceProfile = findProfileConfig(AWS.PROFILE.REFERENCE_PROFILE)
  if (!referenceProfile) {
    throw new Error(
      `参照元のAWS profile "${AWS.PROFILE.REFERENCE_PROFILE}" が見つかりません`
    )
  }

  if (!referenceProfile.roleArn || !referenceProfile.sourceProfile) {
    throw new Error(
      `AWS profile "${AWS.PROFILE.REFERENCE_PROFILE}" に role_arn または source_profile が設定されていません`
    )
  }

  appendProfileToAwsConfig(
    profileName,
    referenceProfile.roleArn,
    referenceProfile.sourceProfile
  )

  log(`AWS profile "${profileName}" を作成しました`)

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      awsProfileName: profileName,
    },
  }
}

function profileAlreadyExists(profileName: string): boolean {
  const configPath = getAwsConfigPath()

  if (!existsSync(configPath)) {
    return false
  }

  const config = readFileSync(configPath, 'utf-8')
  return config.includes(`[profile ${profileName}]`)
}

function appendProfileToAwsConfig(
  profileName: string,
  roleArn: string,
  sourceProfile: string
): void {
  const configPath = getAwsConfigPath()
  const profileConfig = `
[profile ${profileName}]
role_arn = ${roleArn}
source_profile = ${sourceProfile}
`

  appendFileSync(configPath, profileConfig, 'utf-8')
}

function findProfileConfig(profileName: string): AwsProfileConfig | null {
  const configPath = getAwsConfigPath()

  if (!existsSync(configPath)) {
    return null
  }

  const profiles = parseAwsConfig(configPath)
  return profiles.find((p) => p.profileName === profileName) ?? null
}

function parseAwsConfig(configPath: string): AwsProfileConfig[] {
  const content = readFileSync(configPath, 'utf-8')
  const profiles: AwsProfileConfig[] = []
  let currentProfile: AwsProfileConfig | null = null

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (trimmed.startsWith('[profile ')) {
      if (currentProfile) {
        profiles.push(currentProfile)
      }
      const profileName = trimmed.slice(9, -1).trim()
      currentProfile = { profileName }
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentProfile) {
        profiles.push(currentProfile)
      }
      const profileName = trimmed.slice(1, -1).trim()
      currentProfile = { profileName }
    } else if (currentProfile && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (!key) continue

      const value = valueParts.join('=').trim()
      const trimmedKey = key.trim()

      if (trimmedKey === 'role_arn') {
        currentProfile.roleArn = value
      } else if (trimmedKey === 'source_profile') {
        currentProfile.sourceProfile = value
      } else if (trimmedKey === 'region') {
        currentProfile.region = value
      }
    }
  }

  if (currentProfile) {
    profiles.push(currentProfile)
  }

  return profiles
}

function getAwsConfigPath(): string {
  return path.join(homedir(), '.aws', 'config')
}
