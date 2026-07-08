import Database, { type Database as DbType } from 'better-sqlite3'
import path from 'node:path'

const __dirname = path.resolve()
const db: DbType = new Database(path.join(__dirname, 'db/database.db'), {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
  readonly: true,
})

export class SqliteModel {
  static get() {}
}
