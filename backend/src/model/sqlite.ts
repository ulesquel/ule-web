import { db, writerDb } from '@/configs/db.js';
import {
    BadRequestError,
    DatabaseConnectionError,
    NotFoundError,
    UnauthorizedError,
} from '@/errors/errors.js';
import type { FestObject, Type } from '@/types/types.js';
import type {
    Admin,
    Editor,
    FiltersKeys,
    NewAdmin,
    NewEditor,
    Token,
    User,
} from '@/types/users.js';
import bcrypt from 'bcrypt';
import { SqliteError } from 'better-sqlite3';
import { v2 } from 'cloudinary';
import { hash, type UUID } from 'node:crypto';

const saltRounds = 10
const { uploader } = v2

db.pragma('foreign_keys = ON')
writerDb.pragma('foreign_keys = ON')

export class SqliteModel {
  private static userPrepared = db.prepare(
    'SELECT id_user, username, password, role FROM users WHERE username = ?',
  )

  private static festsPrepared = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ?',
  )

  private static festsPreparedWithoutFestTypeConditional = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests',
  )

  private static festByIdPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE id_fest = ?',
  )

  private static getRefreshTokenPrepared = db.prepare(
    'SELECT token, id_user FROM refresh_tokens WHERE token = ?',
  )

  private static getRefreshTokenByTokenIdPrepared = db.prepare(
    'SELECT id_refresh_token FROM refresh_tokens WHERE id_refresh_token = ?',
  )

  private static getUserByIdPrepared = db.prepare(
    'SELECT username FROM users WHERE id_user = @value',
  )

  private static insertFestsPrepared = writerDb.prepare(
    'INSERT INTO fests (id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@id_fest, @frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
  )

  private static deleteFestPrepared = writerDb.prepare(
    'DELETE FROM fests WHERE id_fest = ?',
  )

  private static insertUserPrepared = writerDb.prepare(
    'INSERT INTO users (id_user, username, password, role) VALUES (@id_user, @username, @password, @role)',
  )

  private static insertRefreshTokenPrepared = writerDb.prepare(
    'INSERT INTO refresh_tokens (id_refresh_token, token, id_user) VALUES (@id_refresh_token, @token, @id_user)',
  )

  private static deleteRefreshTokenPrepared = writerDb.prepare(
    'DELETE FROM refresh_tokens WHERE token = ?',
  )

  private static deleteAllUserTokensPrepared = writerDb.prepare(
    'DELETE FROM refresh_tokens WHERE id_user = ?',
  )

  private static deleteUserPrepared = writerDb.prepare(
    'DELETE FROM users WHERE id_user = ?',
  )

  private static catchErrors(error: unknown) {
    if (error instanceof BadRequestError) {
      throw new BadRequestError(error.message)
    }
    if (error instanceof NotFoundError) {
      throw new NotFoundError(error.message)
    }
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError(error.message)
    }
    if (error instanceof SqliteError) {
      console.error(error)
      throw new DatabaseConnectionError(
        'Hubo un error al intentar conectar a la base de datos, intente más tarde',
      )
    }
    console.error(error)
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
      const { changes } = this.deleteFestPrepared.run(id)
      if (changes === 0)
        throw new NotFoundError('No se encontró ninguna jornada para eliminar')
      return `Se eliminó ${changes} jornada`
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static async register({
    username,
    password,
    role,
  }: NewEditor | NewAdmin): Promise<string | void> {
    try {
      const user = this.userPrepared.get(username)

      if (user)
        throw new BadRequestError(
          'Este nombre de usuario no está disponible, utilice otro',
        )

      const id = crypto.randomUUID()

      const hashedPassword = bcrypt.hashSync(password, saltRounds)

      const newUser: User<typeof role> = {
        id_user: id,
        username: username,
        password: hashedPassword,
        role,
      }

      const { changes } = this.insertUserPrepared.run(newUser)
      if (changes === 0)
        throw new Error(
          'No se pudo agregar el nuevo admin por un error desconocido',
        )
      return 'Se agregó un nuevo administrador'
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static async getUser(username: string, password: string) {
    try {
      if (!username || !password)
        throw new BadRequestError('Complete todos los campos')

      const user = this.userPrepared.get(username) as Admin | Editor

      if (typeof user === 'undefined')
        throw new NotFoundError('Revise la contraseña o el nombre de usuario')

      const isMatched = bcrypt.compareSync(password, user.password)
      if (!isMatched)
        throw new BadRequestError(
          'Credenciales inválidas, revise la contraseña o el nombre de usuario',
        )
      return { id_user: user.id_user, role: user.role }
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static getRefreshToken(token: string) {
    try {
      const foundToken = this.getRefreshTokenPrepared.get(token) as
        | Token
        | undefined
      if (typeof foundToken === 'undefined')
        throw new UnauthorizedError('No está autorizado, no existe un token')
      return foundToken
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static saveNewToken(
    tokenId: string /* This must should be the jti */,
    token: string,
    userId: string,
  ) {
    try {
      const { changes } = this.insertRefreshTokenPrepared.run({
        id_refresh_token: tokenId,
        token,
        id_user: userId,
      })

      return changes
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static deleteRefreshToken(token: string): void {
    try {
      this.deleteRefreshTokenPrepared.run(token)
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static revokeAllTokensForUser(userId: string): void {
    try {
      this.deleteAllUserTokensPrepared.run(userId)
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static validateToken(userId: string, tokenId: UUID /* The jti */): void {
    try {
      const token = this.getRefreshTokenByTokenIdPrepared.get(tokenId)
      if (typeof token === 'undefined') {
        this.revokeAllTokensForUser(userId)
        throw new UnauthorizedError(
          'Este token no es válido, revocando todos los tokens',
        )
      }
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static deleteUser({ id }: { id: UUID }) {
    try {
      if (!id)
        throw new BadRequestError('Pase una ID de usuario para eliminar uno')

      const { changes } = this.deleteUserPrepared.run(id)

      if (changes === 0)
        throw new NotFoundError('No se encontró el usuario a eliminar')

      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  static getUserBy(filter: FiltersKeys, value: string) {
    try {
      if (filter === 'id_user') {
        const filteredUser = this.getUserByIdPrepared.get({ value })
        if (!filteredUser)
          throw new NotFoundError(
            `No se encontró el usuario con ${filter} ${value}`,
          )
        return filteredUser
      }
    } catch (error) {
      this.catchErrors(error)
    }
  }
}
