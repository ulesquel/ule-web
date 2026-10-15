import type { Request, Response } from 'express'
import { handleErrors } from './handle-errors.js'

export function Trycatch(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: [Request, Response]) {
    try {
      const returnedValue = originalMethod.apply(this, args)
      return returnedValue
    } catch (error) {
      const [_, res] = args
      return handleErrors(res, error)
    }
  }
}

export function AsyncTrycatch(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: [Request, Response]) {
    try {
      const returnedValue = await originalMethod.apply(this, args)
      return returnedValue
    } catch (error) {
      const [_, res] = args
      console.error(error)
      return handleErrors(res, error)
    }
  }
}
