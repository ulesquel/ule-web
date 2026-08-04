import type { UUID } from 'crypto'
import { type JwtPayload } from 'jsonwebtoken'

export type Role = 'admin' | 'editor'

export type User<T extends Role> = {
  id_user: UUID
  username: string
  password: string
  role: T
}

export type FiltersKeys = keyof Omit<User<Role>, 'password'>

type Public<T> = Omit<T, 'password' | 'id_user'>
type New<T> = Omit<T, 'id_user'>

export type Admin = User<'admin'>

export type Editor = User<'editor'>

export type PublicAdmin = Public<Admin>

export type PublicEditor = Public<Editor>

export type NewAdmin = New<Admin>

export type NewEditor = New<Editor>

export type Token = {
  token: string
  id_user: string
}

// This type is used on the backend, not in the database
export interface RefreshToken extends JwtPayload {
  userId: string
  role: Role
}
