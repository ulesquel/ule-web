import { handleErrors } from '@/controllers/utilities/handle-errors.js'
import { NotFoundError } from '@/errors/errors.js'
import { SqliteModel } from '@/model/sqlite.js'
import type { FestObject, Type } from '@/types/types.js'
import type { Request, Response } from 'express'

export class FestController {
  static getAll(req: Request, res: Response) {
    try {
      const { fest } = req.query
      const fests = SqliteModel.getAllFests(
        (fest as Type) ?? '',
      ) as FestObject[]
      if (fests.length === 0)
        throw new NotFoundError('No hay tarjetas de ningún tipo aún')
      return res.json(fests)
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static get(req: Request, res: Response) {
    try {
      const { id } = req.params
      const fests = SqliteModel.getFest(id as string)
      return res.json(fests)
    } catch (error) {
      return handleErrors(res, error)
    }
  }

  static save(req: Request, res: Response) {
    const fest = req.body
    const img = req.file

    if (!img || typeof img === 'undefined')
      return res
        .status(400)
        .json({ message: 'Pasá una imagen como portada de la jornada' })

    const uriImage = `data:${img?.mimetype};base64,${img?.buffer.toString('base64')}`
    const info = SqliteModel.insertEvent(fest, uriImage)
    info
      .then((info) =>
        res.status(201).json({
          info,
        }),
      )
      .catch((error) => handleErrors(res, error))
  }

  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const info = SqliteModel.deleteFest(id as string)
      console.log(info)
      res.status(204).json({})
    } catch (error) {
      console.error(error)
      return handleErrors(res, error)
    }
  }
}
