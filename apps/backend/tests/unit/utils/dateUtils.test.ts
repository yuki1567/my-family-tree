import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils'
import { describe, expect, it } from '@jest/globals'

describe('dateUtils', () => {
  describe('formatDateToYYYYMMDD', () => {
    it('有効なDate型をYYYY-MM-DD形式に変換できるか', () => {
      const testDate = new Date('2023-05-15T10:30:00.000Z')
      const result = formatDateToYYYYMMDD(testDate)
      expect(result).toBe('2023-05-15')
    })

    it('null入力の場合、nullを返すか', () => {
      const result = formatDateToYYYYMMDD(null)
      expect(result).toBeNull()
    })

    it('日付の境界値（1月1日）を正しく処理できるか', () => {
      const testDate = new Date('2023-01-01T00:00:00.000Z')
      const result = formatDateToYYYYMMDD(testDate)
      expect(result).toBe('2023-01-01')
    })

    it('日付の境界値（12月31日）を正しく処理できるか', () => {
      const testDate = new Date('2023-12-31T23:59:59.999Z')
      const result = formatDateToYYYYMMDD(testDate)
      expect(result).toBe('2023-12-31')
    })

    it('うるう年の2月29日を正しく処理できるか', () => {
      const testDate = new Date('2024-02-29T12:00:00.000Z')
      const result = formatDateToYYYYMMDD(testDate)
      expect(result).toBe('2024-02-29')
    })

    it('Invalid Dateオブジェクトの場合、エラーがスローされるか', () => {
      const invalidDate = new Date('invalid-date')
      expect(() => formatDateToYYYYMMDD(invalidDate)).toThrow(
        'Invalid time value'
      )
    })
  })

  describe('convertStringToDate', () => {
    it('有効な日付文字列をDate型に変換できるか', () => {
      const dateString = '2023-05-15'
      const result = convertStringToDate(dateString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2023)
      expect(result?.getMonth()).toBe(4) // 月は0ベース
      expect(result?.getDate()).toBe(15)
    })

    it('ISO形式の日付文字列を正しく変換できるか', () => {
      const isoString = '2023-05-15T10:30:00.000Z'
      const result = convertStringToDate(isoString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe(isoString)
    })

    it('undefined入力の場合、nullを返すか', () => {
      const result = convertStringToDate(undefined)
      expect(result).toBeNull()
    })

    it('空文字列の場合、nullを返すか', () => {
      const result = convertStringToDate('')
      expect(result).toBeNull()
    })

    it('不正な日付形式の場合、Invalid Dateを返すか', () => {
      const invalidString = 'invalid-date-format'
      const result = convertStringToDate(invalidString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.toString()).toBe('Invalid Date')
    })

    it('数値のみの文字列の場合、Invalid Dateになるか', () => {
      const timestamp = '1684147800000' // 大きな数値文字列
      const result = convertStringToDate(timestamp)
      expect(result).toBeInstanceOf(Date)
      expect(result?.toString()).toBe('Invalid Date')
    })

    it('境界値（1970-01-01）を正しく処理できるか', () => {
      const epochString = '1970-01-01'
      const result = convertStringToDate(epochString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(1970)
      expect(result?.getMonth()).toBe(0)
      expect(result?.getDate()).toBe(1)
    })

    it('未来の日付を正しく処理できるか', () => {
      const futureString = '2050-12-31'
      const result = convertStringToDate(futureString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2050)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getDate()).toBe(31)
    })
  })
})
