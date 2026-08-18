import type { Frequency, Type } from '@/types/types.js'

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

export const UNAUTHORIZED_MESSAGES = {
  NEED_LOGIN: 'Inicia sesón para acceder a esta info.',
  ESPIRED_TOKEN: 'Su token está vencido.',
  NEED_ACCESS_TOKEN: 'No estás autorizado.',
  REFRESH_TOKEN_NOT_FOUND: 'No está autorizado, no existe un token.',
  INVALID_TOKEN: 'Este token no es válido, revocando todos los tokens',
}
