/**
 * 人物追加フォーム用の型定義
 */
export type PersonForm = {
  /** 氏名（任意） */
  name?: string
  /** 性別（任意） */
  gender?: 'male' | 'female'
  /** 生年月日（任意） */
  birthDate?: string
  /** 没年月日（任意） */
  deathDate?: string
  /** 出生地（任意） */
  birthPlace?: string
  /** メモ（任意） */
  memo?: string
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
  memo?: string
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
  memo: '',
}
