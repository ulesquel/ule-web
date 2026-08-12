import { dbOptions, dbPath } from '@/constants.js'
import Database, { type Database as DbType } from 'better-sqlite3'

export const db: DbType = new Database(dbPath, {
  ...dbOptions,
  readonly: true,
})

export const writerDb: DbType = new Database(dbPath, dbOptions)
