import { describe, expect, it } from 'vitest'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'

describe('dateUtils', () => {
  describe('formatDateToYYYYMMDD', () => {
    describe('正常系', () => {
      it('有効なDate型をYYYY-MM-DD形式に変換できる', () => {
        const testDate = new Date('2023-05-15T10:30:00.000Z')
        const result = formatDateToYYYYMMDD(testDate)
        expect(result).toBe('2023-05-15')
      })

      it('うるう年の2月29日を正しく処理できる', () => {
        const testDate = new Date('2024-02-29T12:00:00.000Z')
        const result = formatDateToYYYYMMDD(testDate)
        expect(result).toBe('2024-02-29')
      })
    })

    describe('異常系', () => {
      it('null入力の場合、nullを返す', () => {
        const result = formatDateToYYYYMMDD(null)
        expect(result).toBeNull()
      })
    })
  })

  describe('convertStringToDate', () => {
    describe('正常系', () => {
      it('有効な日付文字列をDate型に変換できる', () => {
        const dateString = '2023-05-15'
        const result = convertStringToDate(dateString)
        expect(result).toBeInstanceOf(Date)
        expect(result?.getFullYear()).toBe(2023)
        expect(result?.getMonth()).toBe(4) // 月は0ベース
        expect(result?.getDate()).toBe(15)
      })
    })

    describe('異常系', () => {
      it('undefined入力の場合、nullを返す', () => {
        const result = convertStringToDate(undefined)
        expect(result).toBeNull()
      })

      it('空文字列の場合、nullを返す', () => {
        const result = convertStringToDate('')
        expect(result).toBeNull()
      })
    })
  })
})
