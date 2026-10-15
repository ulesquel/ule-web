import { jwtSecret, nodeEnv } from '@/configs/app.js'
import {
  accessTokenDuration,
  refreshTokenDuration,
  UNAUTHORIZED_MESSAGES,
} from '@/constants.js'
import { BadRequestError, UnauthorizedError } from '@/errors/errors.js'
import type {
  NewAdmin,
  NewEditor,
  RefreshToken,
  Role,
  Token,
  User,
} from '@/types/users.js'
import type { Model } from '@/types/types.js'
import { AsyncTrycatch } from '@/utilities/decorators.js'
import { generateTokensPair } from '@/utilities/generate-tokens.js'
import { Validator } from '@/utilities/validations.js'
import type { UUID } from 'crypto'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export class UsersController {
  model: Model

  constructor(model: Model) {
    this.model = model
  }
  // Cuando se hace el /refresh el que lo hace en el front es el server, por lo que hay que devolver las cookies en forma de respuesta para que con SSR se agreguen las nuevas cookies
  @AsyncTrycatch
  async refreshToken(req: Request, res: Response) {
    const { refreshToken: cookieRefreshToken } = req.cookies
    const { userId, role } = jwt.verify(
      cookieRefreshToken,
      jwtSecret,
    ) as RefreshToken

    const payload = { userId, role }

    const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

    await this.model.deleteRefreshToken(cookieRefreshToken)

    const rowsChanged = await this.model.saveNewToken(
      tokenId as string,
      refreshToken as string,
      userId,
    )

    if (rowsChanged === 0)
      return res.status(500).json({ message: 'No se pudo guardar el token.' })

    return res.json({ accessToken, refreshToken })
  }

  @AsyncTrycatch
  async register(req: Request, res: Response) {
    const { authorization } = req.headers

    Validator.authorization(authorization)

    const registerData: NewAdmin | NewEditor = req.body

    const { username, password, role } = Validator.newUser(registerData)

    const existingUser = await this.model.getUser(username, password)

    if (existingUser) throw new BadRequestError('Este usuario ya existe')

    const message = await this.model.register({ username, password, role })
    return res.status(201).json({ message })
  }

  @AsyncTrycatch
  async login(req: Request, res: Response) {
    const { refreshToken: currentRefreshToken } = req.cookies
    const { username, password } = req.body

    if (currentRefreshToken) return res.status(302).end()

    const { id_user: userId, role } = (await this.model.getUser(
      username,
      password,
    )) as unknown as User<Role>

    const payload = { userId, role }

    const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

    const rowsChanged = await this.model.saveNewToken(
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
      .json({ message: 'Iniciando sesión...' })
  }

  @AsyncTrycatch
  async renderDashboard(req: Request, res: Response) {
    const { refreshToken } = req.cookies
    if (!refreshToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_LOGIN)

    const { id_user: id } = (await this.model.getRefreshToken(
      refreshToken,
    )) as Token
    const { username, role } = (await this.model.getUserBy(
      'id_user',
      id,
    )) as User<Role>
    res.json({ username, role })
  }

  @AsyncTrycatch
  async getAllUsers(req: Request, res: Response) {
    const { authorization } = req.headers
    Validator.authorization(authorization)

    const users = await this.model.getAllUsers()
    return res.status(200).json(users)
  }

  @AsyncTrycatch
  async logout(req: Request, res: Response) {
    const currentToken = req.cookies?.['refreshToken']
    await this.model.deleteRefreshToken(currentToken)
    return res
      .clearCookie('refreshToken')
      .clearCookie('accessToken')
      .json({ message: 'Cerrando sesión...' })
  }

  @AsyncTrycatch
  async delete(req: Request, res: Response) {
    const { id } = req.params
    const { authorization } = req.headers

    Validator.authorization(authorization)

    await this.model.deleteUser({ id } as { id: UUID })
    res.status(204).json({})
  }
}
