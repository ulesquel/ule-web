export const PORT = 3000
export const isOnDev = process.env?.['DEV'] ?? false
export const jwtSecret = process.env?.['JWT_SECRET'] as string
