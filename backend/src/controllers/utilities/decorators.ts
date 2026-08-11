import type { Request, Response } from 'express'
import { handleErrors } from './handle-errors.js'

export function trycatch(value: Function, { kind, name }: DecoratorContext) {
  if (kind === 'method') {
    return function (...args: [Request, Response]) {
      console.log('Executing', name)
      try {
        const returnedValue = value.call(this, ...args)
        return returnedValue
      } catch (error) {
        return handleErrors(args[1], error)
      }
    }
  }
}

export function asyncTrycatch(
  value: Function,
  { kind, name }: DecoratorContext,
) {
  if (kind === 'method') {
    return async function (...args: [Request, Response]) {
      console.log('Executing', name)
      try {
        const returnedValue = await value.call(this, ...args)
        return returnedValue
      } catch (error) {
        return handleErrors(args[1], error)
      }
    }
  }
}
