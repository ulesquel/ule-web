import { jwtSecret } from '@/configs/app.js'
import { UNAUTHORIZED_MESSAGES } from '@/constants.js'
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '@/errors/errors.js'
import type { NewAdmin, NewEditor, RefreshToken } from '@/types/users.js'
import { Role as RoleValues } from '@/types/users.js'
import jwt from 'jsonwebtoken'

export class Validator {
  static type(value: any, type: string, invalidFor: string) {
    if (typeof value !== type) {
      throw new BadRequestError(`Ingrese un valor válido para ${invalidFor}.`)
    }
  }

  static authorization(authHeader: any) {
    if (!authHeader)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)
    if (typeof authHeader !== 'string')
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)
    const accessToken = authHeader?.split(' ')[1]?.trim() ?? ''
    if (!accessToken)
      throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)

    const decodedToken = jwt.verify(accessToken, jwtSecret) as RefreshToken

    if (decodedToken.role !== 'admin')
      throw new ForbiddenError('No tenes permisos para crear nuevos usuarios.')
  }

  static password(password: string, confirmPassword: string) {
    const passwordRegExp =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).$/

    if (!password || !confirmPassword) {
      throw new BadRequestError('Ingrese una contraseña.')
    }

    this.type(password, 'string', 'contraseña')
    this.type(confirmPassword, 'string', 'confirmar la contraseña')

    if (confirmPassword !== password) {
      throw new BadRequestError('Las contraseñas deben coincidir.')
    }

    if (password.length < 8 || confirmPassword.length < 8) {
      throw new BadRequestError(
        'Las contraseñas deben tener un mínimo de 8 caracteres.',
      )
    }

    if (!passwordRegExp.test(password)) {
      throw new BadRequestError(
        'La contraseña debe tener al menos 1 letra minúscula, 1 mayúscula y un símbolo especial (#, ?, !, @, $, %, ^, &, * ó -)',
      )
    }
  }

  static username(username: string) {
    if (!username) throw new BadRequestError('Ingrese un nombre de usuario.')
    this.type(username, 'string', 'nombre de usuario')
    if (username.length < 4)
      throw new BadRequestError(
        'El nombre de usuario debe tener al menos 4 caracteres.',
      )
  }

  static role(role: any) {
    if (!role) throw new BadRequestError('Pase un rol.')
    this.type(role, 'string', 'rol')
    if (!Object.values(RoleValues).includes(role))
      throw new BadRequestError('Seleccione un rol válido.')
  }

  static newUser(
    registerData: any,
  ): Omit<NewAdmin, 'confirmPassword'> | Omit<NewEditor, 'confirmPassword'> {
    const { username, role, password, confirmPassword } = registerData

    this.username(username)
    this.role(role)
    this.password(password, confirmPassword)

    return { username, role, password }
  }
}
