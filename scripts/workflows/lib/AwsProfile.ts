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
import type { AwsProfileConfig } from '../shared/types.js'
import { log } from '../shared/utils.js'

import { AwsProfileError } from './WorkflowError.js'

export class AwsProfile {
  constructor(private readonly _name: string) {}

  get name(): string {
    return this._name
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
      log(`ℹ️ AWS profile "${this._name}" は存在しません`)
      return
    }

    const updatedContent = this.removeFromConfig(configContent)
    writeFileSync(configPath, updatedContent, 'utf-8')
  }

  private exists(configContent: string): boolean {
    return configContent.includes(`[profile ${this._name}]`)
  }

  private loadConfigContent(): string {
    const configPath = this.getConfigPath()
    if (!existsSync(configPath)) {
      throw new AwsProfileError(
        '',
        'config_file',
        'AwsProfile.loadConfigContent'
      )
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
        throw new AwsProfileError(profile, 'role_arn', 'AwsProfile.getRoleArn')
      }

      return roleArn
    } catch {
      throw new AwsProfileError(profile, 'role_arn', 'AwsProfile.getRoleArn')
    }
  }

  private appendToConfig(roleArn: string, sourceProfile: string): void {
    const configPath = this.getConfigPath()
    const profileLines = [
      '',
      `[profile ${this._name}]`,
      `role_arn = ${roleArn}`,
      `source_profile = ${sourceProfile}`,
      '',
    ]

    appendFileSync(configPath, profileLines.join('\n'), 'utf-8')
  }

  private removeFromConfig(configContent: string): string {
    const lines = configContent.split('\n')
    const profileHeader = `[profile ${this._name}]`
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
