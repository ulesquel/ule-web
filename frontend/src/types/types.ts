export type Badge = 'capacitacion' | 'taller' | 'jornada' | 'concurso'

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type Type = 'workshop' | 'event' | 'competition' | ''

export interface UserData {
  id_user: string
  username: string
  role: 'admin' | 'editor'
}

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
