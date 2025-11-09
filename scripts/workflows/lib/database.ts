import { execSync } from 'node:child_process'

import { DATABASE, DOCKER } from '../shared/constants.js'
import { DatabaseError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

export function createDatabase(dbName: string, adminPassword: string): void {
  log(`🗄 データベース作成: ${dbName}`)

  try {
    execSync(
      `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "CREATE DATABASE ${dbName};"`,
      { stdio: 'inherit' }
    )
    log(`✅ データベース作成完了: ${dbName}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new DatabaseError(`データベース作成に失敗しました: ${errorMessage}`)
  }
}

export function deleteDatabase(dbName: string, adminPassword: string): void {
  log(`🗄 データベース削除: ${dbName}`)

  try {
    execSync(
      `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "DROP DATABASE IF EXISTS ${dbName};"`,
      { stdio: 'inherit' }
    )
    log(`✅ データベース削除完了: ${dbName}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new DatabaseError(`データベース削除に失敗しました: ${errorMessage}`)
  }
}

export function generateDatabaseName(slugTitle: string): string {
  const truncatedSlug = truncateSlugForDatabase(slugTitle)
  return `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
}

function truncateSlugForDatabase(slug: string): string {
  if (slug.length <= DATABASE.MAX_SLUG_LENGTH) {
    return slug
  }

  const lastHyphenIndex = slug.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
  return lastHyphenIndex > 0
    ? slug.substring(0, lastHyphenIndex)
    : slug.substring(0, DATABASE.MAX_SLUG_LENGTH)
}
