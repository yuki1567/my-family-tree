export type Gender = 'male' | 'female' | 'unknown'
export type Relationship = 'father' | 'mother' | 'spouse' | 'child'

// DB層の値定義（Prismaスキーマの性別: 0=不明, 1=男性, 2=女性）
export const GENDER_DB_VALUES = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2,
} as const

// CSS変数キーへのマッピング（性別）
export const GENDER_CSS_KEYS: Record<Gender, string> = {
  unknown: 'gender-unknown',
  male: 'gender-male',
  female: 'gender-female',
}

// CSS変数キーへのマッピング（関係性）
export const RELATIONSHIP_CSS_KEYS: Record<Relationship, string> = {
  father: 'relation-father',
  mother: 'relation-mother',
  spouse: 'relation-spouse',
  child: 'relation-child',
}

// 型定義
export type GenderDbValue =
  (typeof GENDER_DB_VALUES)[keyof typeof GENDER_DB_VALUES]

// 変換関数: DB値 → ドメイン値
export const dbToGender = (dbValue: GenderDbValue): Gender => {
  const map: Record<GenderDbValue, Gender> = {
    0: 'unknown',
    1: 'male',
    2: 'female',
  }
  return map[dbValue]
}

// 変換関数: ドメイン値 → DB値
export const genderToDb = (value: Gender): GenderDbValue => {
  const map: Record<Gender, GenderDbValue> = {
    unknown: 0,
    male: 1,
    female: 2,
  }
  return map[value]
}

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
