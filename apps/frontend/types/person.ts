export type Gender = 'male' | 'female' | 'unknown'
export type Relationship = 'father' | 'mother' | 'spouse' | 'child'

export const GENDER_CSS_KEYS = {
  unknown: 'gender-unknown',
  male: 'gender-male',
  female: 'gender-female',
} as const

export const RELATIONSHIP_CSS_KEYS = {
  father: 'relation-father',
  mother: 'relation-mother',
  spouse: 'relation-spouse',
  child: 'relation-child',
} as const

export type PersonForm = {
  name?: string
  gender: 'male' | 'female' | 'unknown'
  birthDate?: string
  deathDate?: string
  birthPlace?: string
}

export type ValidationErrors = {
  name?: string
  gender?: string
  birthDate?: string
  deathDate?: string
  birthPlace?: string
}

export const GENDER_OPTIONS = [
  { label: '男性', value: 'male' },
  { label: '女性', value: 'female' },
] as const

export const INITIAL_PERSON_FORM: PersonForm = {
  name: '',
  gender: 'unknown',
  birthDate: '',
  deathDate: '',
  birthPlace: '',
}

export type Person = {
  id: string
  name?: string
  gender: string
  birthDate?: string
  deathDate?: string
  birthPlace?: string
}
