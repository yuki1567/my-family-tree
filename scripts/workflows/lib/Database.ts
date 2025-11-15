import { DATABASE } from '../shared/constants.js'

export class Database {
  private readonly _name: string
  private readonly _adminUrl: string
  private readonly _userUrl: string

  constructor(
    slugTitle: string,
    adminUser: string,
    adminPassword: string,
    user: string,
    userPassword: string
  ) {
    this._name = this.generateName(slugTitle)
    this._adminUrl = this.buildDatabaseUrl(adminUser, adminPassword, 'postgres')
    this._userUrl = this.buildDatabaseUrl(user, userPassword, this._name)
  }

  get name(): string {
    return this._name
  }

  get adminUrl(): string {
    return this._adminUrl
  }

  get userUrl(): string {
    return this._userUrl
  }

  private generateName(slugTitle: string): string {
    const truncatedSlug = this.truncateSlug(slugTitle)
    return `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
  }

  private truncateSlug(slug: string): string {
    if (slug.length <= DATABASE.MAX_SLUG_LENGTH) {
      return slug
    }

    const lastHyphenIndex = slug.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
    return lastHyphenIndex > 0
      ? slug.substring(0, lastHyphenIndex)
      : slug.substring(0, DATABASE.MAX_SLUG_LENGTH)
  }

  private buildDatabaseUrl(
    user: string,
    password: string,
    name: string
  ): string {
    return `postgresql://${user}:${password}@db:5432/${name}`
  }
}
