import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorCodeSchema,
  ErrorDetail,
  ErrorDetailSchema,
  ErrorResponse,
  ErrorResponseSchema,
  ValidationErrorCode,
  ValidationErrorCodeSchema,
  makeApiResponseSchema,
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
        const result = ValidationErrorCodeSchema.safeParse('INVALID_VALIDATION_CODE')
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

  describe('makeApiResponseSchema', () => {
    describe('正常系', () => {
      it('成功レスポンスをパースできる', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const successResponse: ApiSuccessResponse<{ id: string; name: string }> = {
          success: true,
          data: { id: '1', name: 'John' },
        }

        const result = UserResponseSchema.safeParse(successResponse)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(successResponse)
        }
      })

      it('エラーレスポンスをパースできる', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            statusCode: 404,
            errorCode: 'NOT_FOUND',
          },
        }

        const result = UserResponseSchema.safeParse(errorResponse)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(errorResponse)
        }
      })

      it('discriminated unionにより型を判別できる', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const successResponse: ApiResponse<{ id: string; name: string }> = {
          success: true,
          data: { id: '1', name: 'John' },
        }

        const result = UserResponseSchema.safeParse(successResponse)
        expect(result.success).toBe(true)
        if (result.success && result.data.success) {
          // TypeScript型推論により、dataプロパティにアクセス可能
          expect(result.data.data.id).toBe('1')
          expect(result.data.data.name).toBe('John')
        }
      })
    })

    describe('異常系', () => {
      it('successプロパティが欠けている場合、パースに失敗する', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const invalidResponse = { data: { id: '1', name: 'John' } }
        const result = UserResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })

      it('success=trueだがdataが欠けている場合、パースに失敗する', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const invalidResponse = { success: true }
        const result = UserResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })

      it('success=falseだがerrorが欠けている場合、パースに失敗する', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const invalidResponse = { success: false }
        const result = UserResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })

      it('dataスキーマに合わないデータの場合、パースに失敗する', () => {
        const UserSchema = z.object({
          id: z.string(),
          name: z.string(),
        })
        const UserResponseSchema = makeApiResponseSchema(UserSchema)

        const invalidResponse = {
          success: true,
          data: { id: 123, name: 'John' }, // idがnumberなので不正
        }
        const result = UserResponseSchema.safeParse(invalidResponse)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('型の互換性確認', () => {
    it('既存のApiSuccessResponse型と互換性がある', () => {
      const response: ApiSuccessResponse<{ id: string }> = {
        success: true,
        data: { id: '1' },
      }
      expect(response.success).toBe(true)
      expect(response.data.id).toBe('1')
    })

    it('既存のApiErrorResponse型と互換性がある', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        },
      }
      expect(response.success).toBe(false)
      expect(response.error.statusCode).toBe(404)
    })

    it('既存のApiResponse型と互換性がある', () => {
      const successResponse: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: '1' },
      }
      const errorResponse: ApiResponse<{ id: string }> = {
        success: false,
        error: {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
        },
      }

      expect(successResponse.success).toBe(true)
      expect(errorResponse.success).toBe(false)
    })
  })
})
