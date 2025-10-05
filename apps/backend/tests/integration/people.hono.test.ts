import { createHonoApp } from '@/app.hono.js'
import { personRoutesHono } from '@/routes/personRoutes.hono.js'
import { TestPrismaManager } from '@/tests/helpers/prismaHelpers.js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('POST /api/people - 人物追加API (Hono版)', () => {
  const app = createHonoApp()
  app.route('/api', personRoutesHono)

  const prisma = TestPrismaManager.getTestDbConnection()

  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.people.deleteMany()
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
      const dbRecord = await prisma.people.findUnique({
        where: { id: createdId },
      })

      expect(dbRecord).toBeTruthy()
      expect(dbRecord!.id).toBe(createdId)
      expect(dbRecord!.name).toBe(requestData.name)
      expect(dbRecord!.gender).toBe(requestData.gender)
      expect(dbRecord!.birthDate).toEqual(new Date(requestData.birthDate))
      expect(dbRecord!.deathDate).toEqual(new Date(requestData.deathDate))
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
          name: null,
          gender: 0,
          birthDate: null,
          deathDate: null,
          birthPlace: null,
        },
      })

      const createdId = body.data.id
      const dbRecord = await prisma.people.findUnique({
        where: { id: createdId },
      })

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
