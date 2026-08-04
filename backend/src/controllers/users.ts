import { jwtSecret } from '@/config.js'
import { SqliteModel } from '@/model/sqlite.js'
import type {
  NewAdmin,
  NewEditor,
  RefreshToken,
  Role,
  Token,
  User,
} from '@/types/users.js'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { handleErrors } from '@/controllers/utilities/handle-errors.js'
import { generateTokensPair } from '@/controllers/utilities/generate-tokens.js'
import type { UUID } from 'crypto'

export class UsersController {
  static refreshToken(req: Request, res: Response) {
    const { userId, role } = jwt.verify(
      req.cookies?.['refreshToken'],
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
        maxAge: 15 * 60 * 1000 /* 15 min */,
      })
      .json({ accessToken })
  }

  static async register(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { body } = req
      const { username, password } = body

      const { id_user: userId, role } = (await SqliteModel.getUser(
        username,
        password,
      )) as unknown as User<Role>

      const payload = { userId, role }

      const [accessToken, refreshToken, tokenId] = generateTokensPair(payload)

      const rowsChanged = SqliteModel.saveNewToken(
        tokenId as string,
        refreshToken as string,
        userId,
      )

      if (rowsChanged === 0)
        return res.status(500).json({ message: 'No se pudo guardar el token' })

      return res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000 /* 1 week */,
        })
        .json({ accessToken })
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static renderDashboard(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies
      const { id_user: id } = SqliteModel.getRefreshToken(refreshToken) as Token
      const { username } = SqliteModel.getUserBy('id_user', id) as User<Role>
      res.render('dashboard', { id, username })
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static logout(req: Request, res: Response) {
    try {
      const currentToken = req.cookies?.['refreshToken']
      SqliteModel.deleteRefreshToken(currentToken)
      return res
        .clearCookie('refreshToken')
        .json({ message: 'Cerrando sesión...' })
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params
    SqliteModel.deleteUser({ id } as { id: UUID })
    res.status(204).json({})
  }
}
