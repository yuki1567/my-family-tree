import { createApp } from '@/app.js'
import { prisma } from '@/database/config/database.js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'

describe('POST /api/people - 人物追加API', () => {
  const app = createApp()

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

      const response = await request(app)
        .post('/api/people')
        .send(requestData)
        .expect(201)

      expect(response.body).toEqual({
        isSuccess: true,
        data: {
          id: expect.any(String),
          ...requestData,
        },
      })

      const createdId = response.body.data.id
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

      const response = await request(app)
        .post('/api/people')
        .send(requestData)
        .expect(201)

      expect(response.body).toEqual({
        isSuccess: true,
        data: {
          id: expect.any(String),
          name: null,
          gender: 0,
          birthDate: null,
          deathDate: null,
          birthPlace: null,
        },
      })

      const createdId = response.body.data.id
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

      const response = await request(app)
        .post('/api/people')
        .send(requestData)
        .expect(400)

      expect(response.body).toEqual({
        isSuccess: false,
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'gender',
              code: 'INVALID_GENDER',
            }),
          ]),
        },
      })
    })
  })
})
