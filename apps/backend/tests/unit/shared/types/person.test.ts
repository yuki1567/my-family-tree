import {
  GENDER_CSS_KEYS,
  GENDER_DB_VALUES,
  RELATIONSHIP_CSS_KEYS,
  dbToGender,
  genderToDb,
} from '@shared/types/person.js'
import { describe, expect, it } from 'vitest'

describe('person types', () => {
  describe('GENDER_DB_VALUES', () => {
    it('Prismaスキーマの性別値定数が正しく定義されている', () => {
      expect(GENDER_DB_VALUES.UNKNOWN).toBe(0)
      expect(GENDER_DB_VALUES.MALE).toBe(1)
      expect(GENDER_DB_VALUES.FEMALE).toBe(2)
    })
  })

  describe('GENDER_CSS_KEYS', () => {
    it('性別値からCSS変数キーへのマッピングが正しく定義されている', () => {
      expect(GENDER_CSS_KEYS.unknown).toBe('gender-unknown')
      expect(GENDER_CSS_KEYS.male).toBe('gender-male')
      expect(GENDER_CSS_KEYS.female).toBe('gender-female')
    })
  })

  describe('RELATIONSHIP_CSS_KEYS', () => {
    it('関係性値からCSS変数キーへのマッピングが正しく定義されている', () => {
      expect(RELATIONSHIP_CSS_KEYS.father).toBe('relation-father')
      expect(RELATIONSHIP_CSS_KEYS.mother).toBe('relation-mother')
      expect(RELATIONSHIP_CSS_KEYS.spouse).toBe('relation-spouse')
      expect(RELATIONSHIP_CSS_KEYS.child).toBe('relation-child')
    })
  })

  describe('dbToGender', () => {
    describe('正常系', () => {
      it('DB値0を"unknown"に変換できる', () => {
        expect(dbToGender(0)).toBe('unknown')
      })

      it('DB値1を"male"に変換できる', () => {
        expect(dbToGender(1)).toBe('male')
      })

      it('DB値2を"female"に変換できる', () => {
        expect(dbToGender(2)).toBe('female')
      })

      it('GENDER_DB_VALUES定数を使用してDB値を変換できる', () => {
        expect(dbToGender(GENDER_DB_VALUES.UNKNOWN)).toBe('unknown')
        expect(dbToGender(GENDER_DB_VALUES.MALE)).toBe('male')
        expect(dbToGender(GENDER_DB_VALUES.FEMALE)).toBe('female')
      })
    })
  })

  describe('genderToDb', () => {
    describe('正常系', () => {
      it('"unknown"をDB値0に変換できる', () => {
        expect(genderToDb('unknown')).toBe(0)
      })

      it('"male"をDB値1に変換できる', () => {
        expect(genderToDb('male')).toBe(1)
      })

      it('"female"をDB値2に変換できる', () => {
        expect(genderToDb('female')).toBe(2)
      })
    })
  })

  describe('双方向変換の整合性', () => {
    it('DB値→ドメイン値→DB値の変換が元の値に戻る', () => {
      expect(genderToDb(dbToGender(0))).toBe(0)
      expect(genderToDb(dbToGender(1))).toBe(1)
      expect(genderToDb(dbToGender(2))).toBe(2)
    })

    it('ドメイン値→DB値→ドメイン値の変換が元の値に戻る', () => {
      expect(dbToGender(genderToDb('unknown'))).toBe('unknown')
      expect(dbToGender(genderToDb('male'))).toBe('male')
      expect(dbToGender(genderToDb('female'))).toBe('female')
    })
  })
})
