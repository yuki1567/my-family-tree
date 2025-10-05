import { createHonoApp } from '@/app.hono.js'
import { AppError } from '@/errors/AppError.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('createHonoApp', () => {
  it('Honoアプリケーションインスタンスを返すこと', () => {
    const app = createHonoApp()
    expect(app).toBeDefined()
    expect(typeof app.fetch).toBe('function')
  })

  describe('エラーハンドリング', () => {
    it('ZodErrorを400エラーとして処理すること', async () => {
      const app = createHonoApp()

      // ZodErrorをスローするルートを追加
      app.get('/test-zod-error', (c) => {
        const schema = z.object({ name: z.string() })
        schema.parse({ name: 123 }) // 意図的にエラーを発生させる
        return c.json({ ok: true })
      })

      const res = await app.request('/test-zod-error')
      const json = (await res.json()) as {
        error: {
          statusCode: number
          errorCode: string
          details: Array<{ field: string; code: string }>
        }
      }

      expect(res.status).toBe(400)
      expect(json.error.statusCode).toBe(400)
      expect(json.error.errorCode).toBe('VALIDATION_ERROR')
      expect(json.error.details).toHaveLength(1)
      expect(json.error.details[0]?.field).toBe('name')
    })

    it('PrismaClientKnownRequestErrorを500エラーとして処理すること', async () => {
      const app = createHonoApp()

      // PrismaErrorをスローするルートを追加
      app.get('/test-prisma-error', (_c) => {
        throw new PrismaClientKnownRequestError('Database error', {
          code: 'P2002',
          clientVersion: '5.0.0',
        })
      })

      const res = await app.request('/test-prisma-error')
      const json = (await res.json()) as {
        error: { statusCode: number; errorCode: string; details: unknown[] }
      }

      expect(res.status).toBe(500)
      expect(json.error.statusCode).toBe(500)
      expect(json.error.errorCode).toBe('DATABASE_ERROR')
      expect(json.error.details).toEqual([])
    })

    it('AppErrorを適切なステータスコードで処理すること', async () => {
      const app = createHonoApp()

      // AppErrorをスローするルートを追加
      app.get('/test-app-error', (_c) => {
        throw new AppError('リソースが見つかりません', 404, 'NOT_FOUND')
      })

      const res = await app.request('/test-app-error')
      const json = (await res.json()) as {
        error: { statusCode: number; errorCode: string; details: unknown[] }
      }

      expect(res.status).toBe(404)
      expect(json.error.statusCode).toBe(404)
      expect(json.error.errorCode).toBe('NOT_FOUND')
      expect(json.error.details).toEqual([])
    })

    it('予期しないエラーを500エラーとして処理すること', async () => {
      const app = createHonoApp()

      // 一般的なエラーをスローするルートを追加
      app.get('/test-unknown-error', (_c) => {
        throw new Error('予期しないエラー')
      })

      const res = await app.request('/test-unknown-error')
      const json = (await res.json()) as {
        error: { statusCode: number; errorCode: string; details: unknown[] }
      }

      expect(res.status).toBe(500)
      expect(json.error.statusCode).toBe(500)
      expect(json.error.errorCode).toBe('UNKNOWN_ERROR')
      expect(json.error.details).toEqual([])
    })
  })
})
