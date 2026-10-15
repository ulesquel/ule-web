import { NotFoundError } from '@/errors/errors.js'
import type { FestObject, Type } from '@/types/types.js'
import { AsyncTrycatch } from '@/utilities/decorators.js'
import type { Request, Response } from 'express'
import type { Model } from '@/types/types.js'

export class FestController {
  model: Model

  constructor(model: Model) {
    this.model = model
  }

  @AsyncTrycatch
  async getAll(req: Request, res: Response) {
    const fest = req?.query?.['fest']
    const fests = (await this.model.getAllFests(
      (fest as Type) ?? '',
    )) as FestObject[]

    return res.json(fests)
  }

  @AsyncTrycatch
  async get(req: Request, res: Response) {
    const { id } = req.params
    const fest = await this.model.getFest(id as string)
    if (!fest)
      throw new NotFoundError(`No se encontró una jornada con la id ${id}`)
    return res.json(fest)
  }

  @AsyncTrycatch
  async save(req: Request, res: Response) {
    const fest = req.body
    const img = req.file

    if (!img || typeof img === 'undefined')
      return res
        .status(400)
        .json({ message: 'Pasá una imagen como portada de la jornada.' })

    const uriImage = `data:${img?.mimetype};base64,${img?.buffer.toString('base64')}`
    const info = await this.model.insertEvent(fest, uriImage)
    res.status(201).json({
      info,
    })
  }

  @AsyncTrycatch
  async delete(req: Request, res: Response) {
    const { id } = req.params
    const info = await this.model.deleteFest(id as string)
    console.log(info)
    res.status(204).json({})
  }
}
