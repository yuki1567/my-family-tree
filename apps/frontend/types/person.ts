import type { Gender, Relationship } from '@shared/types/person.js'

/**
 * CSS変数キーへのマッピング（性別）
 */
export const GENDER_CSS_KEYS: Record<Gender, string> = {
  unknown: 'gender-unknown',
  male: 'gender-male',
  female: 'gender-female',
}

/**
 * CSS変数キーへのマッピング（関係性）
 */
export const RELATIONSHIP_CSS_KEYS: Record<Relationship, string> = {
  father: 'relation-father',
  mother: 'relation-mother',
  spouse: 'relation-spouse',
  child: 'relation-child',
}

/**
 * 人物追加フォーム用の型定義
 */
export type PersonForm = {
  /** 氏名（任意） */
  name?: string
  /** 性別（任意） */
  gender?: 'male' | 'female' | 'unknown'
  /** 生年月日（任意） */
  birthDate?: string
  /** 没年月日（任意） */
  deathDate?: string
  /** 出生地（任意） */
  birthPlace?: string
}

/**
 * フォームバリデーション結果
 */
export type ValidationErrors = {
  name?: string
  gender?: string
  birthDate?: string
  deathDate?: string
  birthPlace?: string
}

/**
 * 人物の性別オプション
 */
export const GENDER_OPTIONS = [
  { label: '男性', value: 'male' },
  { label: '女性', value: 'female' },
] as const

/**
 * PersonFormの初期値
 */
export const INITIAL_PERSON_FORM: PersonForm = {
  name: '',
  gender: undefined,
  birthDate: '',
  deathDate: '',
  birthPlace: '',
}
