import type { Request, Response } from 'express'
import { handleErrors } from './handle-errors.js'

export function trycatch(value: Function, { kind }: DecoratorContext) {
  if (kind === 'method') {
    return function (this: unknown, ...args: [Request, Response]) {
      try {
        const returnedValue = value.call(this, ...args)
        return returnedValue
      } catch (error) {
        const [_, res] = args
        return handleErrors(res, error)
      }
    }
  }
}

export function asyncTrycatch(value: Function, { kind }: DecoratorContext) {
  if (kind === 'method') {
    return async function (this: unknown, ...args: [Request, Response]) {
      try {
        const returnedValue = await value.call(this, ...args)
        return returnedValue
      } catch (error) {
        return handleErrors(args[1], error)
      }
    }
  }
}
