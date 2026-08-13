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
