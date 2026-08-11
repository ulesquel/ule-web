import { type Request, type Response } from 'express'
import morgan from 'morgan'

type Status = keyof typeof COLORED_CODES

type Methods = keyof typeof COLORED_METHODS

const COLORED_CODES = {
  // <Status Code>: <colored ANSI code>
  500: 31,
  400: 33,
  300: 36,
  200: 32,
}

const COLORED_METHODS = {
  GET: 36,
  POST: 32,
  PUT: 33,
  DELETE: 31,
  PATCH: 34,
  QUERY: 35,
}

const colorStatus = (status: string | number | undefined) => {
  const code = Number(status) || 0
  const colorCode: (typeof COLORED_CODES)[keyof typeof COLORED_CODES] =
    COLORED_CODES[(Number(code.toString().split('')[0]) * 100) as Status] ?? 0

  if (colorCode === 0) {
    return String(code)
  }

  return `\x1b[${colorCode}m${code}\x1b[0m`
}

const colorMethod = (value: string | undefined) => {
  if (!value) return '-'
  const colorMethod = COLORED_METHODS[value as Methods] ?? 0

  if (colorMethod === 0) return value

  return `\x1b[1;${colorMethod}m${value}\x1b[0m`
}

const colorDate = (value: string | undefined) => {
  if (!value) {
    return '-'
  }

  return `\x1b[1;95m${value}\x1b[0m`
}

const colorUrl = (value: string | undefined) => {
  if (!value) return '-'

  return `\x1b[33m${value}\x1b[0m`
}

const morganOwnDevStyle: morgan.FormatFn<Request, Response> = (
  tokens,
  req,
  res,
) => {
  const method = colorMethod(tokens['method']!(req, res))
  const status = colorStatus(tokens['status']!(req, res))
  const url = colorUrl(tokens['url']!(req, res))
  const length = tokens['res']!(req, res, 'content-length') || '-'
  const responseTime = tokens['response-time']!(req, res)
  const date = colorDate(tokens['date']!(req, res, 'web'))

  return `${method} ${status} ${url} ${length} - ${responseTime} ms - [${date}]`
}

export const logger = morgan(morganOwnDevStyle)
