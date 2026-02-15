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
import type { SsoProfileConfig } from '../shared/types.js'
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

    const ssoConfig = this.findReferenceSsoConfig()
    this.appendToConfig(ssoConfig)
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

  public generateEnvrc(worktreePath: string, issueNumber: number): void {
    const envrcPath = path.join(worktreePath, '.envrc')
    const content = [
      `export APP_ENV=worktree/${issueNumber}`,
      `export AWS_PROFILE=${this._name}`,
      '',
    ].join('\n')

    writeFileSync(envrcPath, content, 'utf-8')

    try {
      execSync('direnv allow', { cwd: worktreePath, encoding: 'utf-8' })
    } catch {
      log(
        '⚠️ direnv allow に失敗しました。手動で direnv allow を実行してください'
      )
    }
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

  private findReferenceSsoConfig(): SsoProfileConfig {
    const ref = AWS.PROFILE.REFERENCE_PROFILE
    return {
      ssoSession: this.getConfigValue(ref, 'sso_session'),
      ssoAccountId: this.getConfigValue(ref, 'sso_account_id'),
      ssoRoleName: this.getConfigValue(ref, 'sso_role_name'),
      region: this.getConfigValue(ref, 'region'),
    }
  }

  private getConfigValue(profile: string, key: string): string {
    try {
      const result = execSync(`aws configure get profile.${profile}.${key}`, {
        encoding: 'utf-8',
      })
      const value = result.trim()

      if (!value) {
        throw new AwsProfileError(profile, key, 'AwsProfile.getConfigValue')
      }

      return value
    } catch {
      throw new AwsProfileError(profile, key, 'AwsProfile.getConfigValue')
    }
  }

  private appendToConfig(ssoConfig: SsoProfileConfig): void {
    const configPath = this.getConfigPath()
    const profileLines = [
      '',
      `[profile ${this._name}]`,
      `sso_session = ${ssoConfig.ssoSession}`,
      `sso_account_id = ${ssoConfig.ssoAccountId}`,
      `sso_role_name = ${ssoConfig.ssoRoleName}`,
      `region = ${ssoConfig.region}`,
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
