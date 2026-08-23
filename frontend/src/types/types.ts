export type Badge = 'capacitacion' | 'taller' | 'jornada' | 'concurso'

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type Type = 'workshop' | 'event' | 'competition' | ''

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export interface UserData {
  id_user: string
  username: string
  password: string
  role: Role
}

export type RegisterUserData = Pick<
  UserData,
  'username' | 'password' | 'role'
> & {
  confirmPassword: string
}

export type LoginData = Pick<UserData, 'username' | 'password'>

export interface Fest {
  id_fest: string
  frequency: Frequency
  name: string
  objective: string
  description: string
  init_date: string
  end_date: string
  address: string
  fest_type: Type
  img: string
}

export interface FetchError {
  status: 'error'
  error: { message: string }
  code: number
}

export interface FetchSuccess<T> {
  status: 'success'
  data: T
}
