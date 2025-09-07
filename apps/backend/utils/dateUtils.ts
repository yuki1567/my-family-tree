/**
 * Date型をYYYYMMDD形式の文字列に変換する
 * @param date 変換対象のDate型またはnull
 * @returns YYYYMMDD形式の文字列またはnull
 */
export const formatDateToYYYYMMDD = (date: Date | null): string | null => {
  if (!date) return null
  const isoString = date.toISOString()
  const datePart = isoString.substring(0, 10)
  return datePart.replace(/-/g, '')
}

/**
 * 文字列をDate型に変換する
 * @param dateStr 変換対象の文字列またはundefined
 * @returns Date型またはnull
 */
export const convertStringToDate = (
  dateStr: string | undefined,
): Date | null => {
  if (!dateStr) return null
  return new Date(dateStr)
}
