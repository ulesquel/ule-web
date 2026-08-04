import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors/errors.js'
import type { Response } from 'express'
import jwt from 'jsonwebtoken'

export const handleErrors = (res: Response, error: unknown) => {
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      message: error.message,
    })
  } else if (error instanceof BadRequestError) {
    return res.status(400).json({
      message: error.message,
    })
  } else if (error instanceof DatabaseConnectionError) {
    return res.status(503).json({
      message: error.message,
    })
  } else if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(401).json({
      message: 'No estás autorizado',
    })
  } else {
    console.log(error)
    return res.status(500).json({
      message:
        'Ocurrió un error inesperado, estamos trabajando para arreglarlo',
    })
  }
}
