import { db } from '@/configs/db.js'
import { UNAUTHORIZED_MESSAGES } from '@/constants.js'
import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors/errors.js'
import { SqlQueries } from '@/model/queries.js'
import type { FestObject, Model, Type } from '@/types/types.js'
import type {
  Admin,
  Editor,
  FiltersKeys,
  NewAdmin,
  NewEditor,
  Role,
  Token,
  User,
} from '@/types/users.js'
import bcrypt from 'bcrypt'
import { SqliteError } from 'better-sqlite3'
import { v2 } from 'cloudinary'
import { hash, type UUID } from 'node:crypto'

const saltRounds = 10
const { uploader } = v2

await db.pragma('foreign_keys = ON')

export class SqliteModel implements Model {
  queries: SqlQueries

  constructor(queries: SqlQueries) {
    this.queries = queries
  }

  private async catchErrors(error: unknown) {
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

  async getFest(id: string): Promise<FestObject | void> {
    try {
      if (id === '') throw new BadRequestError('Pase una ID')
      const fest = await this.queries.festByIdPrepared.then(stmt => stmt.get(id)) as FestObject
      if (typeof fest === 'undefined')
        throw new NotFoundError('No se encontró ninguna jornada')
      return fest
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  async getAllFests(type: Type = ''): Promise<FestObject[] | void> {
    try {
      if (type === '')
        return await this.queries.festsPreparedWithoutFestTypeConditional.then(stmt => stmt.all()) as FestObject[]
      const fests = await this.queries.festsPrepared.then(stmt => stmt.all(type)) as FestObject[]
      return fests
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  async insertEvent(
    fest: FestObject,
    img: string,
  ): Promise<string | void> {
    try {
      // La propiedad secure_url te devuelve la url de la imagen
      const { name } = fest

      const id_fest = hash('sha256', JSON.stringify(fest))

      const currentFests = await this.queries.festsPrepared.then(stmt => stmt.all(
        fest.fest_type,
      )) as FestObject[]
      if (
        Array.isArray(currentFests) &&
        currentFests.some((fest) => fest.id_fest === id_fest)
      )
        throw new BadRequestError('Ésta jornada ya existe')
      const imageUploaded = await uploader.upload(img, {
        overwrite: true,
        public_id: name.split(' ').join('_').toLowerCase(),
      })
      const { changes } = await this.queries.insertFestsPrepared.then(stmt => stmt.run({
        ...fest,
        id_fest,
        img: imageUploaded.secure_url,
      }))
      return `Se agregó ${changes} nueva jornada`
    } catch (error: unknown) {
      this.catchErrors(error)
    }
  }

  async deleteFest(id: string): Promise<string | void> {
    try {
      if (id === '') throw new BadRequestError('Pase una ID')
      const { changes } = await this.queries.deleteFestPrepared.then(stmt => stmt.run(id))
      if (changes === 0)
        throw new NotFoundError('No se encontró ninguna jornada para eliminar')
      return `Se eliminó ${changes} jornada`
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async register({
    username,
    password,
    role,
  }: Omit<NewEditor, 'confirmPassword'> | Omit<NewAdmin, 'confirmPassword'>):
    Promise<string | void> {
    try {
      const user = await this.queries.userPrepared.then(stmt => stmt.get(username))

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

      const { changes } = await this.queries.insertUserPrepared.then(stmt => stmt.run(newUser))
      if (changes === 0)
        throw new Error(
          'No se pudo agregar el nuevo admin por un error desconocido',
        )
      return `Se agregó un nuevo ${role}`
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async getAllUsers() {
    try {
      const users = await this.queries.allUsersPrepared.then(stmt => stmt.all()) as User<Role>[] | []
      return users
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async getUser(username: string, password: string) {
    try {
      if (!username || !password)
        throw new BadRequestError('Complete todos los campos')

      const user = await this.queries.userPrepared.then(stmt => stmt.get(username)) as Admin | Editor

      if (typeof user === 'undefined')
        throw new NotFoundError('Revise la contraseña o el nombre de usuario')

      const isMatched = bcrypt.compareSync(password, user.password)
      if (!isMatched)
        throw new BadRequestError(
          'Credenciales inválidas, revise la contraseña o el nombre de usuario',
        )
      return { id_user: user.id_user, role: user.role } as User<Role>
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async getRefreshToken(token: string) {
    try {
      const foundToken = await this.queries.getRefreshTokenPrepared.then(stmt => stmt.get(token)) as
        | Token
        | undefined
      if (typeof foundToken === 'undefined')
        throw new UnauthorizedError(
          UNAUTHORIZED_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
        )
      return foundToken
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async saveNewToken(
    tokenId: string /* This must should be the jti */,
    token: string,
    userId: string,
  ) {
    try {
      const { changes } = await this.queries.insertRefreshTokenPrepared.then(stmt => stmt.run({
        id_refresh_token: tokenId,
        token,
        id_user: userId,
      }))

      console.log(`${changes} new token saved`)
      return changes
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      const { changes } = await this.queries.deleteRefreshTokenPrepared.then(stmt => stmt.run(token))
      console.log(`${changes} token removed`)
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async revokeAllTokensForUser(userId: string): Promise<void> {
    try {
      const { changes } =
        await this.queries.deleteAllUserTokensPrepared.then(stmt => stmt.run(userId))
      console.log(`${changes} tokens removed`)
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async validateToken(userId: string, tokenId: UUID /* The jti */): Promise<void> {
    try {
      const token =
        await this.queries.getRefreshTokenByTokenIdPrepared.then(stmt => stmt.get(tokenId))
      if (typeof token === 'undefined') {
        this.revokeAllTokensForUser(userId)
        throw new UnauthorizedError(UNAUTHORIZED_MESSAGES.INVALID_TOKEN)
      }
      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async deleteUser({ id }: { id: UUID }) {
    try {
      if (!id)
        throw new BadRequestError('Pase una ID de usuario para eliminar uno')

      const { changes } = await this.queries.deleteUserPrepared.then(stmt => stmt.run(id))

      if (changes === 0)
        throw new NotFoundError('No se encontró el usuario a eliminar')

      return
    } catch (error) {
      this.catchErrors(error)
    }
  }

  async getUserBy(filter: FiltersKeys, value: string) {
    try {
      if (filter === 'id_user') {
        const filteredUser = await this.queries.getUserByIdPrepared.then(stmt => stmt.get({ value }))
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
