import type { UUID } from 'node:crypto'
import type {
  FiltersKeys,
  NewAdmin,
  NewEditor,
  Role,
  Token,
  User,
} from '@/types/users.js'

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type Type = 'workshop' | 'event' | 'competition' | ''

// * These attributes are in snake_case because the database has it like these.
export interface FestObject {
  id_fest: string
  frequency: Frequency
  name: string
  objective: string
  description: string
  init_date: string
  end_date: string
  address: string
  fest_type: Type
}

export interface Model {
  getFest(id: string): Promise<FestObject | void>
  getAllFests(type?: Type): Promise<FestObject[] | void>
  insertEvent(fest: FestObject, img: string): Promise<string | void>
  deleteFest(id: string): Promise<string | void>
  getAllUsers(): Promise<User<Role>[] | void>
  getUser(username: string, password: string): Promise<User<Role> | void>
  getRefreshToken(token: string): Promise<Token | void>
  saveNewToken(
    tokenId: string /* This must should be the jti */,
    token: string,
    userId: string,
  ): Promise<number | void>
  register({
    username,
    password,
    role,
  }:
    | Omit<NewEditor, 'confirmPassword'>
    | Omit<NewAdmin, 'confirmPassword'>): Promise<string | void>
  deleteRefreshToken(token: string): Promise<void>
  revokeAllTokensForUser(userId: string): Promise<void>
  validateToken(userId: string, tokenId: UUID /* The jti */): Promise<void>
  deleteUser({ id }: { id: UUID }): Promise<void>
  getUserBy(filter: FiltersKeys, value: string): Promise<User<Role> | void>
}
