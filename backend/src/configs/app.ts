export const PORT = 3000
export const nodeEnv = process.env?.['NODE_ENV'] ?? false
export const jwtSecret = process.env?.['JWT_SECRET'] as string
export const frontUrl = process.env?.['FRONTEND_URL'] as string
