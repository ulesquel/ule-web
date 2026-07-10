import Database, { type Database as DbType } from 'better-sqlite3'
import { v2 as cloudinary } from 'cloudinary'
import path from 'node:path'
import type { FestObject, Type } from '@/types/types.js'
import { cloudinaryConfig } from '@/cloudinary-config/config.js'

const __dirname = path.resolve()
const db: DbType = new Database(path.join(__dirname, 'db/database.db'), {
  timeout: 13000,
  fileMustExist: true,
  verbose: console.log,
  readonly: true,
})

cloudinaryConfig()

export class SqliteModel {
  private static festsPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ?',
  )

  private static festByIdPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ? AND id_fest = ?',
  )

  private static insertFestsPrepared = db.prepare(
    'INSERT INTO fests (frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
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
    fest: FestObject /*, img: any*/,
  ): Promise<string | void> {
    try {
      // La propiedad secure_url te devuelve la url de la imagen
      const { name } = fest
      const imageUploaded = await cloudinary.uploader.upload('', {
        overwrite: true,
        public_id: name.split(' ').join('_').toLowerCase(),
      })
      const { changes } = this.insertFestsPrepared.run({
        ...fest,
        img: imageUploaded.secure_url,
      })
      return `${changes} rows modified`
    } catch (e) {
      console.error('Appears an error trying to insert a new event')
    }
  }
}
