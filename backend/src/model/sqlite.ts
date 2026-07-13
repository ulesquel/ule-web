import Database, { type Database as DbType } from 'better-sqlite3'
import { v2 } from 'cloudinary'
import path from 'node:path'
import type { FestObject, Type } from '@/types/types.js'
import { SqliteError } from 'better-sqlite3'
import { hash } from 'node:crypto'
import { BadRequestError, DatabaseConnectionError } from '@/errors/errors.js'

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

  private static festByIdPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ? AND id_fest = ?',
  )

  private static insertFestsPrepared = writerDb.prepare(
    'INSERT INTO fests (id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@id_fest, @frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
  )

  static getFest(type: Type, id: string): FestObject | string | void {
    try {
      const fest = this.festByIdPrepared.get(type, id) as FestObject
      if (typeof fest === 'undefined') return `Could not find the ${type}`
      return fest
    } catch (e) {
      console.error(`Appears an error trying to get the ${type}`)
    }
  }

  static getAllFests(type: Type): FestObject[] | string | void {
    try {
      const fests = this.festsPrepared.all(type) as FestObject[]
      if (fests.length === 0) return `There are no fests of type ${type}`
      return fests
    } catch (e) {
      console.error(`Appears an error trying to get the ${type}s`)
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
      const currentFests = this.getAllFests(fest.fest_type)
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
      return `${changes} rows modified`
    } catch (e) {
      if (BadRequestError.isError(e)) {
        console.error(e)
        throw new BadRequestError(e.message)
      }
      if (SqliteError.isError(e)) {
        console.error(e)
        throw new DatabaseConnectionError(
          'Hubo un error al intentar conectar a la base de datos, intente más tarde',
        )
      }
      console.error('Unkown error', e)
      throw new Error(
        'Hubo un error desconocido en el servidor, estamos trabajando en solucionarlo',
      )
    }
  }
}
