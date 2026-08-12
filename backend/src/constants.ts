import type { Frequency, Type } from './types/types.js'

export const accessTokenDuration = 15 * 60 * 1000
export const refreshTokenDuration = 7 * 24 * 60 * 60 * 1000

export const frequencies: Frequency[] = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
]

export const festTypes: Type[] = ['competition', 'event', 'workshop']

// DB constants
export const dbPath = `${process.cwd()}/db/database.db`
export const dbOptions = {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
}
