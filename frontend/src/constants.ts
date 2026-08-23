import type { LoginData, RegisterUserData } from '@/types/types'
import type { AstroCookieSetOptions } from 'astro'
import type { RegisterOptions } from 'react-hook-form'
const nodeEnv = import.meta.env.NODE_ENV

export const usernameValidators: RegisterOptions<
  LoginData | RegisterUserData,
  'username'
> = {
  required: 'El nombre de usuario es requerido.',
  minLength: {
    value: 4,
    message: 'El nombre de usuario tiene que tener al menos 4 caracteres.',
  },
}

export const roleValidators: RegisterOptions<RegisterUserData, 'role'> = {
  required: 'Elija un rol para el nuevo usuario.',
}

export const passwordValidators: RegisterOptions<
  LoginData | RegisterUserData,
  'password'
> = {
  required: 'La contraseña es requerida.',
  minLength: {
    value: 8,
    message: 'La contraseña debe tener al menos 8 caracteres.',
  },
}

export const confirmPasswordValidator: RegisterOptions<
  RegisterUserData,
  'confirmPassword'
> = {
  required: 'Debe confirmar la contraseña',
  minLength: {
    value: 8,
    message: 'La contraseña debe tener al menos 8 caracteres.',
  },
}

export const DIFFERENT_PASSWORD_ERROR = 'Las contraseñas deben coincidir.'

export const accessTokenCookieOptions: AstroCookieSetOptions = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 15 * 60,
  secure: nodeEnv === 'production',
  path: '/',
}
export const refreshTokenCookieOptions: AstroCookieSetOptions = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,
  secure: nodeEnv === 'production',
  path: '/',
}
