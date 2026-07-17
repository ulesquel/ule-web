import Database, { type Database as DbType } from 'better-sqlite3'
import { v2 } from 'cloudinary'
import path from 'node:path'
import type { FestObject, Type } from '@/types/types.js'
import { SqliteError } from 'better-sqlite3'
import { hash } from 'node:crypto'
import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError,
} from '@/errors/errors.js'
import { write } from 'node:fs'

const __dirname = path.resolve()

const db: DbType = new Database(path.join(__dirname, 'db/database.db'), {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
  readonly: true,
})

const writerDb: DbType = new Database(path.join(__dirname, 'db/database.db'), {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
})

const { uploader } = v2

export class SqliteModel {
  private static festsPrepared = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ?',
  )

  private static festsPreparedWithoutFestTypeConditional = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests',
  )

  private static festByIdPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE id_fest = ?',
  )

  private static insertFestsPrepared = writerDb.prepare(
    'INSERT INTO fests (id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@id_fest, @frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
  )

  private static deleteFestPrepared = writerDb.prepare(
    'DELETE FROM fests WHERE id_fest = ?',
  )

  private static catchErrors(error: unknown) {
    if (BadRequestError.isError(error) || NotFoundError.isError(error)) {
      console.error(error)
      throw new BadRequestError(error.message)
    }
    if (SqliteError.isError(error)) {
      console.error(error)
      throw new DatabaseConnectionError(
        'Hubo un error al intentar conectar a la base de datos, intente más tarde',
      )
    }
    console.error('Unkown error', error)
    throw new Error(
      'Hubo un error desconocido en el servidor, estamos trabajando en solucionarlo',
    )
  }

  static getFest(id: string): FestObject | void {
    try {
      if (id === '') throw new BadRequestError('Pase una ID')
      const fest = this.festByIdPrepared.get(id) as FestObject
      if (typeof fest === 'undefined')
        throw new NotFoundError('No se encontró ninguna jornada')
      return fest
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  static getAllFests(type: Type): FestObject[] | void {
    try {
      if (type === '')
        return this.festsPreparedWithoutFestTypeConditional.all() as FestObject[]
      const fests = this.festsPrepared.all(type) as FestObject[]
      if (fests.length === 0) {
        throw new NotFoundError(`No hay alguna jornada registrada`)
      }
      return fests
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  static async insertEvent(
    fest: FestObject,
    img: string,
  ): Promise<string | void> {
    try {
      // La propiedad secure_url te devuelve la url de la imagen
      const { name } = fest

      const id_fest = hash('sha256', JSON.stringify(fest))

      const currentFests = this.festsPrepared.all(
        fest.fest_type,
      ) as FestObject[]
      if (
        Array.isArray(currentFests) &&
        currentFests.some((fest) => fest.id_fest === id_fest)
      )
        throw new BadRequestError('Ésta jornada ya existe')
      const imageUploaded = await uploader.upload(img, {
        overwrite: true,
        public_id: name.split(' ').join('_').toLowerCase(),
      })
      const { changes } = this.insertFestsPrepared.run({
        ...fest,
        id_fest,
        img: imageUploaded.secure_url,
      })
      return `Se agregó ${changes} nueva jornada`
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  static deleteFest(id: string): string | void {
    try {
      if (id === '') throw new BadRequestError('Pase una ID')
      console.log(id)
      const { changes } = this.deleteFestPrepared.run(id)
      if (changes === 0)
        throw new NotFoundError('No se encontró ninguna jornada para eliminar')
      return `Se eliminó ${changes} jornada`
    } catch (error) {
      this.catchErrors(error)
    }
  }
}
