import { db, writerDb } from '@/configs/db.js'

export class SqlQueries {
  userPrepared = db.prepare(
    'SELECT id_user, username, password, role FROM users WHERE username = ?',
  )

  festsPrepared = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE fest_type = ?',
  )

  festsPreparedWithoutFestTypeConditional = db.prepare(
    'SELECT id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests',
  )

  festByIdPrepared = db.prepare(
    'SELECT frequency, name, objective, description, init_date, end_date, address, fest_type, img FROM fests WHERE id_fest = ?',
  )

  getRefreshTokenPrepared = db.prepare(
    'SELECT token, id_user FROM refresh_tokens WHERE token = ?',
  )

  getRefreshTokenByTokenIdPrepared = db.prepare(
    'SELECT id_refresh_token FROM refresh_tokens WHERE id_refresh_token = ?',
  )

  getUserByIdPrepared = db.prepare(
    'SELECT username, role FROM users WHERE id_user = @value',
  )

  allUsersPrepared = db.prepare('SELECT id_user, username, role FROM users')

  insertFestsPrepared = writerDb.prepare(
    'INSERT INTO fests (id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@id_fest, @frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
  )

  deleteFestPrepared = writerDb.prepare('DELETE FROM fests WHERE id_fest = ?')

  insertUserPrepared = writerDb.prepare(
    'INSERT INTO users (id_user, username, password, role) VALUES (@id_user, @username, @password, @role)',
  )

  insertRefreshTokenPrepared = writerDb.prepare(
    'INSERT INTO refresh_tokens (id_refresh_token, token, id_user) VALUES (@id_refresh_token, @token, @id_user)',
  )

  deleteRefreshTokenPrepared = writerDb.prepare(
    'DELETE FROM refresh_tokens WHERE token = ?',
  )

  deleteAllUserTokensPrepared = writerDb.prepare(
    'DELETE FROM refresh_tokens WHERE id_user = ?',
  )

  deleteUserPrepared = writerDb.prepare('DELETE FROM users WHERE id_user = ?')
}
