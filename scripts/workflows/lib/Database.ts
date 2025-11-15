export class Database {
  private readonly _adminUrl: string
  private readonly _userUrl: string

  constructor(
    private readonly _name: string,
    adminUser: string,
    adminPassword: string,
    user: string,
    userPassword: string
  ) {
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

  private buildDatabaseUrl(
    user: string,
    password: string,
    name: string
  ): string {
    return `postgresql://${user}:${password}@db:5432/${name}`
  }
}
