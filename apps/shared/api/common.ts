import { z } from 'zod'

/**
 * エラーコードのZod enum定義
 * 既存のErrorCode型と互換性を保つ
 */
export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'INTERNAL_ERROR',
  'DATABASE_ERROR',
  'UNEXPECTED_ERROR',
])

export type ErrorCode = z.infer<typeof ErrorCodeSchema>

/**
 * バリデーションエラーコードのZod enum定義
 * 既存のValidationErrorCode型と互換性を保つ
 */
export const ValidationErrorCodeSchema = z.enum([
  'NAME_TOO_LONG',
  'INVALID_GENDER',
  'INVALID_DATE_FORMAT',
  'DEATH_BEFORE_BIRTH',
  'BIRTH_PLACE_TOO_LONG',
])

export type ValidationErrorCode = z.infer<typeof ValidationErrorCodeSchema>

/**
 * エラー詳細のZodスキーマ
 * 既存のErrorDetail型と互換性を保つ
 */
export const ErrorDetailSchema = z.object({
  field: z.string(),
  code: z.string(),
})

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>

/**
 * エラーレスポンスのZodスキーマ
 * 既存のErrorResponse型と互換性を保つ
 */
export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  errorCode: z.string(),
  details: z.array(ErrorDetailSchema).optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * APIレスポンスのZodスキーマファクトリ関数
 * discriminated unionパターンにより、成功・失敗レスポンスを型安全に扱う
 *
 * @param dataSchema - 成功時のデータスキーマ
 * @returns 判別可能Union型のAPIレスポンススキーマ
 *
 * @example
 * ```typescript
 * const UserSchema = z.object({ id: z.string(), name: z.string() })
 * const UserResponseSchema = makeApiResponseSchema(UserSchema)
 *
 * // 成功レスポンス
 * const success = { success: true, data: { id: '1', name: 'John' } }
 * // エラーレスポンス
 * const error = { success: false, error: { statusCode: 404, errorCode: 'NOT_FOUND' } }
 * ```
 */
export function makeApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: ErrorResponseSchema,
    }),
  ])
}

/**
 * 成功レスポンスの型定義
 */
export type ApiSuccessResponse<T> = {
  success: true
  data: T
}

/**
 * エラーレスポンスの型定義
 */
export type ApiErrorResponse = {
  success: false
  error: ErrorResponse
}

/**
 * APIレスポンスの型定義（discriminated union）
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
