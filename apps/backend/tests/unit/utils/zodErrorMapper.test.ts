import { mapZodErrorToResponse } from '@/utils/zodErrorMapper.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('zodErrorMapper', () => {
  describe('mapZodErrorToResponse', () => {
    it('単一フィールドのバリデーションエラーを正しくマップする', () => {
      const schema = z.object({
        name: z.string().max(5, { message: 'NAME_TOO_LONG' }),
      })

      const result = schema.safeParse({ name: 'very long name' })

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: 'name',
              code: 'NAME_TOO_LONG',
            },
          ],
        },
      })
    })

    it('複数フィールドのバリデーションエラーを正しくマップする', () => {
      const schema = z.object({
        name: z.string().max(5, { message: 'NAME_TOO_LONG' }),
        age: z.number().min(0, { message: 'AGE_NEGATIVE' }),
      })

      const result = schema.safeParse({
        name: 'very long name',
        age: -1,
      })

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: 'name',
              code: 'NAME_TOO_LONG',
            },
            {
              field: 'age',
              code: 'AGE_NEGATIVE',
            },
          ],
        },
      })
    })

    it('ネストされたフィールドのエラーパスを正しく結合する', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email({ message: 'INVALID_EMAIL' }),
          }),
        }),
      })

      const result = schema.safeParse({
        user: {
          profile: {
            email: 'invalid-email',
          },
        },
      })

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: 'user.profile.email',
              code: 'INVALID_EMAIL',
            },
          ],
        },
      })
    })

    it('配列要素のエラーインデックスを含めて正しくマップする', () => {
      const schema = z.object({
        items: z.array(
          z.object({
            value: z.number().positive({ message: 'VALUE_NOT_POSITIVE' }),
          })
        ),
      })

      const result = schema.safeParse({
        items: [{ value: 1 }, { value: -5 }, { value: 3 }],
      })

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: 'items.1.value',
              code: 'VALUE_NOT_POSITIVE',
            },
          ],
        },
      })
    })

    it('refineカスタムバリデーションエラーを正しくマップする', () => {
      const schema = z
        .object({
          birthDate: z.string(),
          deathDate: z.string(),
        })
        .refine((data) => data.birthDate <= data.deathDate, {
          message: 'DEATH_BEFORE_BIRTH',
          path: ['deathDate'],
        })

      const result = schema.safeParse({
        birthDate: '2020-01-01',
        deathDate: '2019-01-01',
      })

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: 'deathDate',
              code: 'DEATH_BEFORE_BIRTH',
            },
          ],
        },
      })
    })

    it('空のパス配列を空文字列として扱う', () => {
      const schema = z.string().max(5, { message: 'TOO_LONG' })

      const result = schema.safeParse('very long string')

      if (result.success) {
        throw new Error('Expected validation to fail')
      }

      const response = mapZodErrorToResponse(result.error)

      expect(response).toEqual({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: [
            {
              field: '',
              code: 'TOO_LONG',
            },
          ],
        },
      })
    })
  })
})
