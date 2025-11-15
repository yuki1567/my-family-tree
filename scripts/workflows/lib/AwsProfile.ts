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
import type { AwsProfileConfig } from '../shared/types.js'
import { log } from '../shared/utils.js'

export class AwsProfile {
  private readonly profileName: string

  constructor(issueNumber: number) {
    this.profileName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  }

  get name(): string {
    return this.profileName
  }

  public create(): void {
    const configContent = this.loadConfigContent()

    if (this.exists(configContent)) {
      return
    }

    const referenceProfile = this.findReferenceConfig()

    this.appendToConfig(
      referenceProfile.roleArn,
      referenceProfile.sourceProfile
    )
  }

  public delete(): void {
    const configPath = this.getConfigPath()

    if (!existsSync(configPath)) {
      log(`ℹ️ AWS config ファイルが存在しません: ${configPath}`)
      return
    }

    const configContent = readFileSync(configPath, 'utf-8')

    if (!this.exists(configContent)) {
      log(`ℹ️ AWS profile "${this.profileName}" は存在しません`)
      return
    }

    const updatedContent = this.removeFromConfig(configContent)
    writeFileSync(configPath, updatedContent, 'utf-8')
  }

  private exists(configContent: string): boolean {
    return configContent.includes(`[profile ${this.profileName}]`)
  }

  private loadConfigContent(): string {
    const configPath = this.getConfigPath()
    if (!existsSync(configPath)) {
      throw new AwsProfileConfigError('', 'config_file')
    }
    return readFileSync(configPath, 'utf-8')
  }

  private findReferenceConfig(): AwsProfileConfig {
    const roleArn = this.getRoleArn(AWS.PROFILE.REFERENCE_PROFILE)
    return { roleArn, sourceProfile: 'default' }
  }

  private getRoleArn(profile: string): string {
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

  private appendToConfig(roleArn: string, sourceProfile: string): void {
    const configPath = this.getConfigPath()
    const profileLines = [
      '',
      `[profile ${this.profileName}]`,
      `role_arn = ${roleArn}`,
      `source_profile = ${sourceProfile}`,
      '',
    ]

    appendFileSync(configPath, profileLines.join('\n'), 'utf-8')
  }

  private removeFromConfig(configContent: string): string {
    const lines = configContent.split('\n')
    const profileHeader = `[profile ${this.profileName}]`
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

  private getConfigPath(): string {
    return path.join(homedir(), '.aws', 'config')
  }
}
