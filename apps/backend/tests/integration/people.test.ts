import { createHonoApp } from '@/app.js'
import { people } from '@/database/schema.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'
import { TestDrizzleManager } from '@/tests/helpers/drizzleHelpers.js'
import { eq } from 'drizzle-orm'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /api/people - 人物追加API', () => {
  const app = createHonoApp()
  app.route('/api', peopleRoutes)

  const db = TestDrizzleManager.getTestDbConnection()

  afterAll(async () => {
    await TestDrizzleManager.closeTestDbConnection()
  })

  beforeEach(async () => {
    await db.delete(people)
  })

  describe('正常系', () => {
    it('有効なデータの場合、201ステータスでレスポンスを返すか', async () => {
      const requestData = {
        name: '田中花子',
        gender: 2,
        birthDate: '1985-05-15',
        deathDate: '2020-12-31',
        birthPlace: '大阪府',
      }

      const response = await app.request('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body).toEqual({
        data: {
          id: expect.any(String),
          ...requestData,
        },
      })

      const createdId = body.data.id
      const [dbRecord] = await db
        .select()
        .from(people)
        .where(eq(people.id, createdId))

      expect(dbRecord).toBeTruthy()
      expect(dbRecord!.id).toBe(createdId)
      expect(dbRecord!.name).toBe(requestData.name)
      expect(dbRecord!.gender).toBe(requestData.gender)
      expect(dbRecord!.birthDate).toBe(requestData.birthDate)
      expect(dbRecord!.deathDate).toBe(requestData.deathDate)
      expect(dbRecord!.birthPlace).toBe(requestData.birthPlace)
      expect(dbRecord!.createdAt).toBeInstanceOf(Date)
      expect(dbRecord!.updatedAt).toBeInstanceOf(Date)
    })

    it('最小限のデータの場合、201ステータスでレスポンスを返すか', async () => {
      const requestData = {}

      const response = await app.request('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body).toEqual({
        data: {
          id: expect.any(String),
          gender: 0,
        },
      })

      const createdId = body.data.id
      const [dbRecord] = await db
        .select()
        .from(people)
        .where(eq(people.id, createdId))

      expect(dbRecord).toBeTruthy()
      expect(dbRecord!.id).toBe(createdId)
      expect(dbRecord!.name).toBeNull()
      expect(dbRecord!.gender).toBe(0)
      expect(dbRecord!.birthDate).toBeNull()
      expect(dbRecord!.deathDate).toBeNull()
      expect(dbRecord!.birthPlace).toBeNull()
      expect(dbRecord!.createdAt).toBeInstanceOf(Date)
      expect(dbRecord!.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('異常系', () => {
    it('バリデーションエラーの場合、400エラーを返すか', async () => {
      const requestData = {
        name: 'テスト',
        gender: 3, // 無効な性別
        birthDate: '1990-01-01',
      }

      const response = await app.request('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toHaveProperty('error')
    })
  })
})
