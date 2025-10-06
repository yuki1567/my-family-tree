import { ZodError } from 'zod'

/**
 * ZodErrorを統一エラーレスポンス形式に変換
 *
 * @param error - Zodバリデーションエラー
 * @returns 統一エラーレスポンス形式
 *
 * @example
 * const result = schema.safeParse(data)
 * if (!result.success) {
 *   return mapZodErrorToResponse(result.error)
 * }
 */
export function mapZodErrorToResponse(error: ZodError): {
  error: {
    statusCode: number
    errorCode: string
    details: Array<{ field: string; code: string }>
  }
} {
  const details = error.issues.map((e) => ({
    field: e.path.join('.'),
    code: e.message,
  }))

  return {
    error: {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      details,
    },
  }
}
