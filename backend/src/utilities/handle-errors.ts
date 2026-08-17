import { UNAUTHORIZED_MESSAGES } from '@/constants.js'
import {
  BadRequestError,
  DatabaseConnectionError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors/errors.js'
import type { Response } from 'express'
import jwt from 'jsonwebtoken'

export const handleErrors = (res: Response, error: unknown) => {
  console.error(
    '\x1b[1;31m================================================\x1b[0m',
  )
  console.error(`\x1b[1;31m${error}\x1b[0m`)
  console.error(
    '\x1b[1;31m================================================\x1b[0m',
  )

  if (error instanceof BadRequestError) {
    return res.status(400).json({
      message: error.message,
    })
  }

  if (
    error instanceof UnauthorizedError ||
    error instanceof jwt.JsonWebTokenError
  ) {
    if (error.message === UNAUTHORIZED_MESSAGES.NEED_ACCESS_TOKEN)
      return res.status(418).json({ message: error.message })
    if (error.message === UNAUTHORIZED_MESSAGES.INVALID_TOKEN)
      return res
        .status(423) // Devuelve un 423 indicando que es un recurso bloqueado, principalmente para que en SSR se eliminen las cookies detectando que es un error 423a
        .clearCookie('refreshToken')
        .clearCookie('accessToken')
        .json({ message: error.message })
    return res.status(401).json({ message: error.message })
  }

  if (error instanceof ForbiddenError) {
    return res.status(403).json({ message: error.message })
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      message: error.message,
    })
  }

  if (error instanceof DatabaseConnectionError) {
    return res.status(503).json({
      message: error.message,
    })
  }

  return res.status(500).json({
    message: 'Ocurrió un error inesperado, estamos trabajando para arreglarlo',
  })
}
