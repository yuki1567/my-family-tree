import {
  ApiErrorResponse,
  ApiErrorResponseSchema,
  ApiResponse,
  ApiSuccessResponse,
  ApiSuccessResponseSchema,
  ErrorCode,
  ErrorCodeSchema,
  ErrorDetail,
  ErrorDetailSchema,
  ErrorResponse,
  ErrorResponseSchema,
  HttpStatusCode,
  HttpStatusCodeSchema,
  ValidationErrorCode,
  ValidationErrorCodeSchema,
} from '@shared/api/common.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('common API schemas', () => {
  describe('ErrorCodeSchema', () => {
    describe('正常系', () => {
      it('有効なエラーコードをパースできる', () => {
        const validCodes: ErrorCode[] = [
          'VALIDATION_ERROR',
          'UNAUTHORIZED',
          'FORBIDDEN',
          'NOT_FOUND',
          'INTERNAL_ERROR',
          'DATABASE_ERROR',
          'UNEXPECTED_ERROR',
        ]

        validCodes.forEach((code) => {
          const result = ErrorCodeSchema.safeParse(code)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data).toBe(code)
          }
        })
      })
    })

    describe('異常系', () => {
      it('無効なエラーコードの場合、パースに失敗する', () => {
        const result = ErrorCodeSchema.safeParse('INVALID_CODE')
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ValidationErrorCodeSchema', () => {
    describe('正常系', () => {
      it('有効なバリデーションエラーコードをパースできる', () => {
        const validCodes: ValidationErrorCode[] = [
          'NAME_TOO_LONG',
          'INVALID_GENDER',
          'INVALID_DATE_FORMAT',
          'DEATH_BEFORE_BIRTH',
          'BIRTH_PLACE_TOO_LONG',
        ]

        validCodes.forEach((code) => {
          const result = ValidationErrorCodeSchema.safeParse(code)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data).toBe(code)
          }
        })
      })
    })

    describe('異常系', () => {
      it('無効なバリデーションエラーコードの場合、パースに失敗する', () => {
        const result = ValidationErrorCodeSchema.safeParse(
          'INVALID_VALIDATION_CODE'
        )
        expect(result.success).toBe(false)
      })
    })
  })

  describe('HttpStatusCodeSchema', () => {
    describe('正常系', () => {
      it('有効なHTTPステータスコードをパースできる', () => {
        const validCodes: HttpStatusCode[] = [200, 201, 400, 401, 403, 404, 500]

        validCodes.forEach((code) => {
          const result = HttpStatusCodeSchema.safeParse(code)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data).toBe(code)
          }
        })
      })
    })

    describe('異常系', () => {
      it('無効なHTTPステータスコードの場合、パースに失敗する', () => {
        const result = HttpStatusCodeSchema.safeParse(999)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ErrorDetailSchema', () => {
    describe('正常系', () => {
      it('有効なエラー詳細をパースできる', () => {
        const errorDetail: ErrorDetail = {
          field: 'name',
          code: 'NAME_TOO_LONG',
        }

        const result = ErrorDetailSchema.safeParse(errorDetail)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(errorDetail)
        }
      })
    })

    describe('異常系', () => {
      it('fieldプロパティが欠けている場合、パースに失敗する', () => {
        const invalidDetail = { code: 'NAME_TOO_LONG' }
        const result = ErrorDetailSchema.safeParse(invalidDetail)
        expect(result.success).toBe(false)
      })

      it('codeプロパティが欠けている場合、パースに失敗する', () => {
        const invalidDetail = { field: 'name' }
        const result = ErrorDetailSchema.safeParse(invalidDetail)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ErrorResponseSchema', () => {
    describe('正常系', () => {
      it('有効なエラーレスポンスをパースできる', () => {
        const errorResponse: ErrorResponse = {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            { field: 'name', code: 'NAME_TOO_LONG' },
            { field: 'birthDate', code: 'INVALID_DATE_FORMAT' },
          ],
        }

        const result = ErrorResponseSchema.safeParse(errorResponse)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(errorResponse)
        }
      })

      it('detailsが省略された場合でもパースできる', () => {
        const errorResponse: ErrorResponse = {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        }

        const result = ErrorResponseSchema.safeParse(errorResponse)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(errorResponse)
        }
      })
    })

    describe('異常系', () => {
      it('statusCodeが無効な値の場合、パースに失敗する', () => {
        const invalidResponse = {
          statusCode: 999,
          errorCode: 'NOT_FOUND',
        }
        const result = ErrorResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })

      it('statusCodeが欠けている場合、パースに失敗する', () => {
        const invalidResponse = { errorCode: 'NOT_FOUND' }
        const result = ErrorResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })

      it('errorCodeが欠けている場合、パースに失敗する', () => {
        const invalidResponse = { statusCode: 404 }
        const result = ErrorResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ApiSuccessResponseSchema', () => {
    it('成功レスポンスをパースできる', () => {
      const UserSchema = z.object({
        id: z.string(),
        name: z.string(),
      })
      const UserSuccessResponseSchema = ApiSuccessResponseSchema(UserSchema)

      const successResponse: ApiSuccessResponse<{
        id: string
        name: string
      }> = {
        data: { id: '1', name: 'John' },
      }

      const result = UserSuccessResponseSchema.safeParse(successResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(successResponse)
      }
    })

    it('dataが欠けている場合、パースに失敗する', () => {
      const UserSchema = z.object({
        id: z.string(),
        name: z.string(),
      })
      const UserSuccessResponseSchema = ApiSuccessResponseSchema(UserSchema)

      const invalidResponse = {}
      const result = UserSuccessResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })
  })

  describe('ApiErrorResponseSchema', () => {
    it('エラーレスポンスをパースできる', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        },
      }

      const result = ApiErrorResponseSchema.safeParse(errorResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(errorResponse)
      }
    })

    it('errorが欠けている場合、パースに失敗する', () => {
      const invalidResponse = {}
      const result = ApiErrorResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })
  })

  describe('型の互換性確認', () => {
    it('既存のApiSuccessResponse型と互換性がある', () => {
      const response: ApiSuccessResponse<{ id: string }> = {
        data: { id: '1' },
      }
      expect(response.data.id).toBe('1')
    })

    it('既存のApiErrorResponse型と互換性がある', () => {
      const response: ApiErrorResponse = {
        error: {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        },
      }
      expect(response.error.statusCode).toBe(404)
    })

    it('既存のApiResponse型と互換性がある', () => {
      const successResponse: ApiResponse<{ id: string }> = {
        data: { id: '1' },
      }
      const errorResponse: ApiResponse<{ id: string }> = {
        error: {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        },
      }

      expect('data' in successResponse).toBe(true)
      expect('error' in errorResponse).toBe(true)
    })
  })
})
