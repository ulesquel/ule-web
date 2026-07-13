type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

type Date =
  `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}`

export type Type = 'workshop' | 'event' | 'competition'

// * These attributes are in snake_case because the database has it like these.
export interface FestObject {
  id_fest: string
  frequency: Frequency
  name: string
  objective: string
  description: string
  init_date: Date
  end_date: Date
  address: string
  fest_type: Type
}
