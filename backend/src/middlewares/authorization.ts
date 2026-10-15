import { jwtSecret } from '@/configs/app.js'
import { UNAUTHORIZED_MESSAGES } from '@/constants.js'
import { UnauthorizedError } from '@/errors/errors.js'
import type { RefreshToken } from '@/types/users.js'
import { handleErrors } from '@/utilities/handle-errors.js'
import type { UUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { sqliteModel } from '@/constants.js'

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { refreshToken } = req.cookies
  try {
    if (!refreshToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_LOGIN)
    const decodedToken = jwt.verify(refreshToken, jwtSecret) as RefreshToken
    const { userId, jti } = decodedToken

    await sqliteModel.validateToken(userId, jti as UUID)

    const foundToken = await sqliteModel.getRefreshToken(refreshToken)
    if (!foundToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.ESPIRED_TOKEN)
    next()
  } catch (error) {
    return handleErrors(res, error)
  }
}
