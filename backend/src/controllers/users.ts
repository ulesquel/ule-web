import { jwtSecret, nodeEnv } from '@/configs/app.js'
import {
  accessTokenDuration,
  refreshTokenDuration,
  UNAUTHORIZED_MESSAGES,
} from '@/constants.js'
import { ForbiddenError, UnauthorizedError } from '@/errors/errors.js'
import { SqliteModel } from '@/model/sqlite.js'
import type {
  NewAdmin,
  NewEditor,
  RefreshToken,
  Role,
  Token,
  User,
} from '@/types/users.js'
import { trycatch } from '@/utilities/decorators.js'
import { generateTokensPair } from '@/utilities/generate-tokens.js'
import type { UUID } from 'crypto'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export class UsersController {
  // Cuando se hace el /refresh el que lo hace en el front es el server, por lo que hay que devolver las cookies en forma de respuesta para que con SSR se agreguen las nuevas cookies
  @trycatch
  static refreshToken(req: Request, res: Response) {
    const { refreshToken: cookieRefreshToken } = req.cookies
    const { userId, role } = jwt.verify(
      cookieRefreshToken,
      jwtSecret,
    ) as RefreshToken

    const payload = { userId, role }

    const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

    SqliteModel.deleteRefreshToken(cookieRefreshToken)

    const rowsChanged = SqliteModel.saveNewToken(
      tokenId as string,
      refreshToken as string,
      userId,
    )

    if (rowsChanged === 0)
      return res.status(500).json({ message: 'No se pudo guardar el token.' })

    return res.json({ accessToken, refreshToken })
  }

  @trycatch
  static register(req: Request, res: Response) {
    const decodedToken = jwt.verify(
      req.cookies?.['refreshToken'],
      jwtSecret,
    ) as RefreshToken

    if (decodedToken.role !== 'admin')
      throw new ForbiddenError('No tenés permisos para crear nuevos usuarios.')
    const { username, password, role }: NewAdmin | NewEditor = req.body
    const message = SqliteModel.register({ username, password, role })
    return res.status(201).json({ message })
  }

  @trycatch
  static login(req: Request, res: Response) {
    const { refreshToken: currentRefreshToken } = req.cookies
    const { username, password } = req.body

    if (currentRefreshToken) return res.status(302).end()

    const { id_user: userId, role } = SqliteModel.getUser(
      username,
      password,
    ) as unknown as User<Role>

    const payload = { userId, role }

    const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

    const rowsChanged = SqliteModel.saveNewToken(
      tokenId as string,
      refreshToken as string,
      userId,
    )

    if (rowsChanged === 0)
      return res.status(500).json({ message: 'No se pudo guardar el token.' })

    return res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: nodeEnv === 'production',
        maxAge: refreshTokenDuration /* 1 week */,
      })
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: nodeEnv === 'production',
        maxAge: accessTokenDuration /* 15 min */,
      })
      .end()
  }

  @trycatch
  static renderDashboard(req: Request, res: Response) {
    const { refreshToken } = req.cookies
    if (!refreshToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_LOGIN)

    const { id_user: id } = SqliteModel.getRefreshToken(refreshToken) as Token
    const { username, role } = SqliteModel.getUserBy(
      'id_user',
      id,
    ) as User<Role>
    res.json({ username, role })
  }

  @trycatch
  static getAllUsers(req: Request, res: Response) {
    const { authorization } = req.headers
    if (!authorization)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)
    const accessToken = authorization?.split(' ')[1]?.trim() ?? ''
    if (!accessToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)
    const decodedToken = jwt.verify(accessToken, jwtSecret) as RefreshToken
    if (decodedToken.role !== 'admin')
      throw new ForbiddenError('No tenes permisos para ver esta información.')
    const users = SqliteModel.getAllUsers()
    return res.status(200).json(users)
  }

  @trycatch
  static logout(req: Request, res: Response) {
    const currentToken = req.cookies?.['refreshToken']
    SqliteModel.deleteRefreshToken(currentToken)
    return res
      .clearCookie('refreshToken')
      .clearCookie('accessToken')
      .json({ message: 'Cerrando sesión...' })
  }

  @trycatch
  static delete(req: Request, res: Response) {
    const { id } = req.params
    SqliteModel.deleteUser({ id } as { id: UUID })
    res.status(204).json({})
  }
}
