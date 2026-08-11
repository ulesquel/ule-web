import { type Request, type Response } from 'express'
import morgan from 'morgan'

const colorStatus = (status: string | number | undefined) => {
  const code = Number(status) || 0
  const colorCode =
    code >= 500
      ? 31
      : code >= 400
        ? 33
        : code >= 300
          ? 36
          : code >= 200
            ? 32
            : 0

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
