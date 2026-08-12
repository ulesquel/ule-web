import { jwtSecret } from '@/configs/app.js'
import { refreshTokenDuration } from '@/constants.js'
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
  @trycatch
  static refreshToken(req: Request, res: Response) {
    const { refreshToken: cookieRefreshToken } = req.cookies
    const { userId, role } = jwt.verify(
      cookieRefreshToken,
      jwtSecret,
    ) as RefreshToken

    const payload = { userId, role }

    const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

    SqliteModel.saveNewToken(tokenId as string, refreshToken as string, userId)

    return res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: refreshTokenDuration /* 1 week */,
      })
      .json({ accessToken })
  }

  @trycatch
  static register(req: Request, res: Response) {
    const decodedToken = jwt.verify(
      req.cookies?.['refreshToken'],
      jwtSecret,
    ) as RefreshToken

    if (decodedToken.role !== 'admin')
      return res
        .status(401)
        .json({ message: 'No estás autorizado para esta acción' })
    const { username, password, role }: NewAdmin | NewEditor = req.body
    console.log(decodedToken)
    console.log(username, password, role)
    // const message = await SqliteModel.register({username, password, role})
    return res.status(201).json({ message: 'testing' })
  }

  @trycatch
  static login(req: Request, res: Response) {
    const { refreshToken: currentRefreshToken } = req.cookies
    const { body } = req
    const { username, password } = body

    if (currentRefreshToken) return res.redirect('/users/dashboard')

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
        sameSite: 'strict',
        secure: true,
        maxAge: refreshTokenDuration /* 1 week */,
      })
      .json({ accessToken })
  }

  @trycatch
  static renderDashboard(req: Request, res: Response) {
    const { refreshToken } = req.cookies
    const { id_user: id } = SqliteModel.getRefreshToken(refreshToken) as Token
    const { username } = SqliteModel.getUserBy('id_user', id) as User<Role>
    res.render('dashboard', { id, username })
  }

  @trycatch
  static getAllUsers(req: Request, res: Response) {
    const { authorization } = req.headers
    if (!authorization) throw new UnauthorizedError('No estás autorizado')
    const accessToken = authorization?.split(' ')[1]?.trim() as string
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
      .json({ message: 'Cerrando sesión...' })
  }

  @trycatch
  static delete(req: Request, res: Response) {
    const { id } = req.params
    SqliteModel.deleteUser({ id } as { id: UUID })
    res.status(204).json({})
  }
}
