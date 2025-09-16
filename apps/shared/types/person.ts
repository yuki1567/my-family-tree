export type Gender = 'male' | 'female'

export type Person = {
  readonly id: string
  name?: string
  gender?: Gender
  birthDate?: string
  deathDate?: string
  birthPlace?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type CreatePersonData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePersonData = Partial<CreatePersonData>
