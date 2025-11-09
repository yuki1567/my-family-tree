import { execSync } from 'node:child_process'
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

import { AWS } from '../shared/constants.js'
import { AwsProfileConfigError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

type AwsProfileConfig = {
  roleArn: string
  sourceProfile: string
}

export function createAwsProfile(issueNumber: number): string {
  const awsProfileName = `${AWS.PROFILE.PREFIX}-${issueNumber}`

  const configContent = loadAwsConfigContent()

  if (profileAlreadyExists(awsProfileName, configContent)) {
    log(`AWS profile "${awsProfileName}" は既に存在します`)
    return awsProfileName
  }

  const referenceProfile = findProfileConfig(AWS.PROFILE.REFERENCE_PROFILE)

  appendProfileToAwsConfig(
    awsProfileName,
    referenceProfile.roleArn,
    referenceProfile.sourceProfile
  )

  log(`AWS profile "${awsProfileName}" を作成しました`)

  return awsProfileName
}

export function deleteAwsProfile(issueNumber: number): void {
  const awsProfileName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  const configPath = getAwsConfigPath()

  if (!existsSync(configPath)) {
    log(`AWS config ファイルが存在しません: ${configPath}`)
    return
  }

  const configContent = readFileSync(configPath, 'utf-8')

  if (!profileAlreadyExists(awsProfileName, configContent)) {
    log(`AWS profile "${awsProfileName}" は存在しません`)
    return
  }

  const updatedContent = removeProfileFromConfig(configContent, awsProfileName)
  writeFileSync(configPath, updatedContent, 'utf-8')

  log(`✅ AWS profile "${awsProfileName}" を削除しました`)
}

function removeProfileFromConfig(
  configContent: string,
  profileName: string
): string {
  const lines = configContent.split('\n')
  const profileHeader = `[profile ${profileName}]`
  const result: string[] = []
  let skipMode = false

  for (const line of lines) {
    if (line.trim() === profileHeader) {
      skipMode = true
      continue
    }

    if (skipMode && line.startsWith('[')) {
      skipMode = false
    }

    if (!skipMode) {
      result.push(line)
    }
  }

  while (result.length > 0 && result[result.length - 1]?.trim() === '') {
    result.pop()
  }

  return result.join('\n') + (result.length > 0 ? '\n' : '')
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
