import { validateBody } from '@/middlewares/validate.js'
import { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

describe('validateBody', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction
  let jsonSpy: ReturnType<typeof vi.fn>
  let statusSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    req = {
      body: {},
    }

    jsonSpy = vi.fn()
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy })

    res = {
      status: statusSpy,
      json: jsonSpy,
    }

    next = vi.fn()
  })

  describe('正常系', () => {
    it('有効なデータの場合、バリデーション済みデータをreq.bodyに設定してnext()を呼ぶ', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const validData = {
        name: 'John',
        age: 30,
      }

      req.body = validData

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(req.body).toEqual(validData)
      expect(next).toHaveBeenCalledOnce()
      expect(statusSpy).not.toHaveBeenCalled()
    })

    it('デフォルト値が適用されたデータがreq.bodyに設定される', () => {
      const schema = z.object({
        name: z.string(),
        gender: z.number().default(0),
      })

      req.body = {
        name: 'Jane',
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(req.body).toEqual({
        name: 'Jane',
        gender: 0,
      })
      expect(next).toHaveBeenCalledOnce()
    })

    it('オプショナルフィールドが欠けていても正常に処理される', () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number(),
      })

      req.body = {
        age: 25,
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(req.body).toEqual({
        age: 25,
      })
      expect(next).toHaveBeenCalledOnce()
    })
  })

  describe('異常系', () => {
    it('バリデーションエラーの場合、400ステータスでエラーレスポンスを返す', () => {
      const schema = z.object({
        name: z.string().max(5, { message: 'NAME_TOO_LONG' }),
      })

      req.body = {
        name: 'very long name',
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith({
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
      expect(next).not.toHaveBeenCalled()
    })

    it('複数のバリデーションエラーを全て返す', () => {
      const schema = z.object({
        name: z.string().max(5, { message: 'NAME_TOO_LONG' }),
        age: z.number().min(0, { message: 'AGE_NEGATIVE' }),
      })

      req.body = {
        name: 'very long name',
        age: -1,
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith({
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'name',
              code: 'NAME_TOO_LONG',
            },
            {
              field: 'age',
              code: 'AGE_NEGATIVE',
            },
          ]),
        },
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('必須フィールドが欠けている場合、適切なエラーを返す', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      req.body = {
        name: 'John',
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
          }),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('型が不正な場合、適切なエラーを返す', () => {
      const schema = z.object({
        age: z.number(),
      })

      req.body = {
        age: 'not a number',
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
          }),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('refineカスタムバリデーションエラーを適切に処理する', () => {
      const schema = z
        .object({
          birthDate: z.string(),
          deathDate: z.string(),
        })
        .refine((data) => data.birthDate <= data.deathDate, {
          message: 'DEATH_BEFORE_BIRTH',
          path: ['deathDate'],
        })

      req.body = {
        birthDate: '2020-01-01',
        deathDate: '2019-01-01',
      }

      const middleware = validateBody(schema)
      middleware(req as Request, res as Response, next)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith({
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
      expect(next).not.toHaveBeenCalled()
    })
  })
})
