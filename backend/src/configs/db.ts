import Database, { type Database as DbType } from 'better-sqlite3';

export const db: DbType = new Database(`${process.cwd()}/db/database.db`, {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
  readonly: true,
})

export const writerDb: DbType = new Database(
  `${process.cwd()}/db/database.db`,
  {
    timeout: 13000,
    fileMustExist: true,
    verbose: console.log,
  },
)
