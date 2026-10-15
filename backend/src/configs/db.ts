import { connect, Connection } from '@tursodatabase/serverless'

const TURSO_DB_URL = process.env['TURSO_DB_URL'] ?? ''
const TURSO_DB_WRITER_TOKEN = process.env['TURSO_DB_WRITER_TOKEN'] ?? ''

const getDb = (): Connection => {
  let cachedDb: Connection | undefined

  if (cachedDb) return cachedDb

  const newDbInstance = connect({
    url: TURSO_DB_URL,
    authToken: TURSO_DB_WRITER_TOKEN,
  })

  cachedDb = newDbInstance

  return newDbInstance
}

export const db: Connection = getDb()
