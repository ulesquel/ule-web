import { db } from '@/configs/db.js'

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

  insertFestsPrepared = db.prepare(
    'INSERT INTO fests (id_fest, frequency, name, objective, description, init_date, end_date, address, fest_type, img) VALUES (@id_fest, @frequency, @name, @objective, @description, @init_date, @end_date, @address, @fest_type, @img)',
  )

  deleteFestPrepared = db.prepare('DELETE FROM fests WHERE id_fest = ?')

  insertUserPrepared = db.prepare(
    'INSERT INTO users (id_user, username, password, role) VALUES (@id_user, @username, @password, @role)',
  )

  insertRefreshTokenPrepared = db.prepare(
    'INSERT INTO refresh_tokens (id_refresh_token, token, id_user) VALUES (@id_refresh_token, @token, @id_user)',
  )

  deleteRefreshTokenPrepared = db.prepare(
    'DELETE FROM refresh_tokens WHERE token = ?',
  )

  deleteAllUserTokensPrepared = db.prepare(
    'DELETE FROM refresh_tokens WHERE id_user = ?',
  )

  deleteUserPrepared = db.prepare('DELETE FROM users WHERE id_user = ?')
}
