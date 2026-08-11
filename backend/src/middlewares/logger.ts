import { type Request, type Response } from 'express'
import morgan from 'morgan'

type Status = 200 | 300 | 400 | 500

const colorStatus = (status: string | number | undefined) => {
  const COLORED_CODES = {
    // <Status Code>: <colored ANSI code>
    500: 31,
    400: 33,
    300: 36,
    200: 32,
  }
  const code = Number(status) || 0
  const colorCode: (typeof COLORED_CODES)[keyof typeof COLORED_CODES] =
    COLORED_CODES[(Number(code.toString().split('')[0]) * 100) as Status] ?? 0

  if (colorCode === 0) {
    return String(code)
  }

  return `\x1b[${colorCode}m${code}\x1b[0m`
}

const colorDate = (value: string | undefined) => {
  if (!value) {
    return '-'
  }

  return `\x1b[35m${value}\x1b[0m`
}

const morganOwnDevStyle: morgan.FormatFn<Request, Response> = (
  tokens,
  req,
  res,
) => {
  const method = tokens['method']!(req, res)
  const status = colorStatus(tokens['status']!(req, res))
  const url = tokens['url']!(req, res)
  const length = tokens['res']!(req, res, 'content-length') || '-'
  const responseTime = tokens['response-time']!(req, res)
  const date = colorDate(tokens['date']!(req, res, 'web'))

  return `${method} ${status} ${url} ${length} - ${responseTime} ms - [${date}]`
}

export const logger = morgan(morganOwnDevStyle)
