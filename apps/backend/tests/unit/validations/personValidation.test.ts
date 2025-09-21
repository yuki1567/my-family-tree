import { createPersonSchema } from '@/validations/personValidation'
import { describe, expect, it } from '@jest/globals'

describe('personValidation', () => {
  describe('createPersonSchema', () => {
    describe('name validation', () => {
      describe('正常系', () => {
        it('有効な名前を受け入れる', () => {
          const data = { name: '山田太郎' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('100文字の名前を受け入れる', () => {
          const longName = 'あ'.repeat(100)
          const data = { name: longName }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('名前なし（undefined）を受け入れる', () => {
          const data = {}
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      describe('異常系', () => {
        it('101文字の名前でNAME_TOO_LONGエラーを返す', () => {
          const longName = 'あ'.repeat(101)
          const data = { name: longName }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('NAME_TOO_LONG')
          }
        })
      })
    })

    describe('gender validation', () => {
      describe('正常系', () => {
        it('性別0（男性）を受け入れる', () => {
          const data = { gender: 0 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.gender).toBe(0)
          }
        })

        it('性別1（女性）を受け入れる', () => {
          const data = { gender: 1 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.gender).toBe(1)
          }
        })

        it('性別2（その他）を受け入れる', () => {
          const data = { gender: 2 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.gender).toBe(2)
          }
        })

        it('性別未指定時はデフォルト値0を設定する', () => {
          const data = {}
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data.gender).toBe(0)
          }
        })
      })

      describe('異常系', () => {
        it('性別-1でINVALID_GENDERエラーを返す', () => {
          const data = { gender: -1 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_GENDER')
          }
        })

        it('性別3でINVALID_GENDERエラーを返す', () => {
          const data = { gender: 3 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_GENDER')
          }
        })

        it('性別1.5（小数）で整数バリデーションエラーを返す', () => {
          const data = { gender: 1.5 }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            // 小数の場合はintegerバリデーションで失敗する
            expect(result.error.errors.length).toBeGreaterThan(0)
          }
        })
      })
    })

    describe('birthDate validation', () => {
      describe('正常系', () => {
        it('有効な日付形式を受け入れる', () => {
          const data = { birthDate: '1990-05-15' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('うるう年の2月29日を受け入れる', () => {
          const data = { birthDate: '2024-02-29' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('生年月日なし（undefined）を受け入れる', () => {
          const data = {}
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      describe('異常系', () => {
        it('無効な日付形式でINVALID_DATE_FORMATエラーを返す', () => {
          const data = { birthDate: '1990/05/15' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_DATE_FORMAT')
          }
        })

        it('存在しない日付でINVALID_DATE_FORMATエラーを返す', () => {
          const data = { birthDate: '2023-02-29' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_DATE_FORMAT')
          }
        })

        it('月が13の場合INVALID_DATE_FORMATエラーを返す', () => {
          const data = { birthDate: '1990-13-15' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_DATE_FORMAT')
          }
        })

        it('日が32の場合INVALID_DATE_FORMATエラーを返す', () => {
          const data = { birthDate: '1990-05-32' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_DATE_FORMAT')
          }
        })
      })
    })

    describe('deathDate validation', () => {
      describe('正常系', () => {
        it('有効な日付形式を受け入れる', () => {
          const data = { deathDate: '2023-12-31' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('没年月日なし（undefined）を受け入れる', () => {
          const data = {}
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      describe('異常系', () => {
        it('無効な日付形式でINVALID_DATE_FORMATエラーを返す', () => {
          const data = { deathDate: '2023/12/31' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('INVALID_DATE_FORMAT')
          }
        })
      })
    })

    describe('birthPlace validation', () => {
      describe('正常系', () => {
        it('有効な出生地を受け入れる', () => {
          const data = { birthPlace: '東京都新宿区' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('200文字の出生地を受け入れる', () => {
          const longPlace = 'あ'.repeat(200)
          const data = { birthPlace: longPlace }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('出生地なし（undefined）を受け入れる', () => {
          const data = {}
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      describe('異常系', () => {
        it('201文字の出生地でBIRTH_PLACE_TOO_LONGエラーを返す', () => {
          const longPlace = 'あ'.repeat(201)
          const data = { birthPlace: longPlace }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('BIRTH_PLACE_TOO_LONG')
          }
        })
      })
    })

    describe('日付関係の相互検証', () => {
      describe('正常系', () => {
        it('生年月日と没年月日が同じ日付を受け入れる', () => {
          const data = {
            birthDate: '1990-05-15',
            deathDate: '1990-05-15'
          }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('生年月日より後の没年月日を受け入れる', () => {
          const data = {
            birthDate: '1990-05-15',
            deathDate: '2023-12-31'
          }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('生年月日のみの場合を受け入れる', () => {
          const data = { birthDate: '1990-05-15' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })

        it('没年月日のみの場合を受け入れる', () => {
          const data = { deathDate: '2023-12-31' }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(true)
        })
      })

      describe('異常系', () => {
        it('没年月日が生年月日より前の場合DEATH_BEFORE_BIRTHエラーを返す', () => {
          const data = {
            birthDate: '1990-05-15',
            deathDate: '1989-12-31'
          }
          const result = createPersonSchema.safeParse(data)
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.errors[0]?.message).toBe('DEATH_BEFORE_BIRTH')
            expect(result.error.errors[0]?.path).toEqual(['deathDate'])
          }
        })
      })
    })

    describe('複合テストケース', () => {
      it('全フィールドが有効な場合を受け入れる', () => {
        const data = {
          name: '山田太郎',
          gender: 0,
          birthDate: '1990-05-15',
          deathDate: '2023-12-31',
          birthPlace: '東京都新宿区'
        }
        const result = createPersonSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('複数のバリデーションエラーがある場合、全てのエラーを返す', () => {
        const data = {
          name: 'あ'.repeat(101), // NAME_TOO_LONG
          gender: 5, // INVALID_GENDER
          birthDate: '1990/05/15', // INVALID_DATE_FORMAT
          birthPlace: 'あ'.repeat(201) // BIRTH_PLACE_TOO_LONG
        }
        const result = createPersonSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const errorMessages = result.error.errors.map(e => e.message)
          expect(errorMessages).toContain('NAME_TOO_LONG')
          expect(errorMessages).toContain('INVALID_GENDER')
          expect(errorMessages).toContain('INVALID_DATE_FORMAT')
          expect(errorMessages).toContain('BIRTH_PLACE_TOO_LONG')
        }
      })
    })
  })
})