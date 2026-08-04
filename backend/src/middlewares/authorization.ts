import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { jwtSecret } from '@/config.js'
import { handleErrors } from '@/controllers/utilities/handle-errors.js'
import { SqliteModel } from '@/model/sqlite.js'
import { UnauthorizedError } from '@/errors/errors.js'
import type { RefreshToken } from '@/types/users.js'
import type { UUID } from 'crypto'

export default function (req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.cookies
  try {
    const decodedToken = jwt.verify(refreshToken, jwtSecret) as RefreshToken
    const { userId, jti } = decodedToken

    SqliteModel.validateToken(userId, jti as UUID)

    const foundToken = SqliteModel.getRefreshToken(refreshToken)
    if (!foundToken) throw new UnauthorizedError('Su token está vencido')
    next()
  } catch (error) {
    return handleErrors(res, error)
  }
}
