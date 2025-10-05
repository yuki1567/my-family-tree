import {
  CreatePersonRequest,
  CreatePersonRequestSchema,
  CreatePersonResponse,
  CreatePersonResponseSchema,
  Gender,
  GenderSchema,
  ListPersonsResponse,
  ListPersonsResponseSchema,
  PaginationMeta,
  PaginationMetaSchema,
  Person,
  PersonSchema,
  UpdatePersonRequest,
  UpdatePersonRequestSchema,
  UpdatePersonResponse,
  UpdatePersonResponseSchema,
} from '@shared/api/persons.js'
import { describe, expect, it } from 'vitest'

describe('persons API schemas', () => {
  describe('GenderSchema', () => {
    describe('正常系', () => {
      it('有効な性別をパースできる', () => {
        const validGenders: Gender[] = ['male', 'female', 'unknown']

        validGenders.forEach((gender) => {
          const result = GenderSchema.safeParse(gender)
          expect(result.success).toBe(true)
          if (result.success) {
            expect(result.data).toBe(gender)
          }
        })
      })
    })

    describe('異常系', () => {
      it('無効な性別の場合、パースに失敗する', () => {
        const result = GenderSchema.safeParse('invalid')
        expect(result.success).toBe(false)
      })
    })
  })

  describe('PersonSchema', () => {
    describe('正常系', () => {
      it('完全なPersonオブジェクトをパースできる', () => {
        const person: Person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '田中太郎',
          gender: 'male',
          birthDate: '1990-05-15',
          deathDate: '2050-12-31',
          birthPlace: '東京都',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(person)
        }
      })

      it('オプショナルフィールドがない場合でもパースできる', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(true)
      })

      it('誕生日と死亡日が同じ場合でもパースできる', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          birthDate: '1990-05-15',
          deathDate: '1990-05-15',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(true)
      })
    })

    describe('異常系', () => {
      it('nameが100文字を超える場合、パースに失敗する', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'a'.repeat(101),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
      })

      it('birthPlaceが200文字を超える場合、パースに失敗する', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          birthPlace: 'a'.repeat(201),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
      })

      it('birthDateがYYYY-MM-DD形式でない場合、パースに失敗する', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          birthDate: '1990/05/15',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
      })

      it('deathDateがYYYY-MM-DD形式でない場合、パースに失敗する', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          deathDate: '2050-12-31 00:00:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
      })

      it('deathDateがbirthDateより前の場合、パースに失敗する', () => {
        const person = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          birthDate: '1990-05-15',
          deathDate: '1989-12-31',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('deathDate')
        }
      })

      it('idがUUID形式でない場合、パースに失敗する', () => {
        const person = {
          id: 'invalid-uuid',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = PersonSchema.safeParse(person)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('CreatePersonRequestSchema', () => {
    describe('正常系', () => {
      it('有効なCreatePersonRequestをパースできる', () => {
        const request: CreatePersonRequest = {
          name: '田中太郎',
          gender: 'male',
          birthDate: '1990-05-15',
          birthPlace: '東京都',
        }

        const result = CreatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(request)
        }
      })

      it('すべてのフィールドがオプショナルで、空オブジェクトでもパースできる', () => {
        const request = {}

        const result = CreatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
      })
    })

    describe('異常系', () => {
      it('deathDateがbirthDateより前の場合、パースに失敗する', () => {
        const request = {
          birthDate: '1990-05-15',
          deathDate: '1989-12-31',
        }

        const result = CreatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('CreatePersonResponseSchema', () => {
    it('有効なCreatePersonResponseをパースできる', () => {
      const response: CreatePersonResponse = {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '田中太郎',
          gender: 'male',
          birthDate: '1990-05-15',
          birthPlace: '東京都',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        },
      }

      const result = CreatePersonResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('dataが欠けている場合、パースに失敗する', () => {
      const invalidResponse = {}
      const result = CreatePersonResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdatePersonRequestSchema', () => {
    describe('正常系', () => {
      it('部分的な更新リクエストをパースできる', () => {
        const request: UpdatePersonRequest = {
          name: '田中花子',
        }

        const result = UpdatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(request)
        }
      })

      it('複数フィールドの更新リクエストをパースできる', () => {
        const request: UpdatePersonRequest = {
          name: '田中花子',
          gender: 'female',
          birthPlace: '大阪府',
        }

        const result = UpdatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
      })

      it('空オブジェクトでもパースできる', () => {
        const request = {}

        const result = UpdatePersonRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('UpdatePersonResponseSchema', () => {
    it('有効なUpdatePersonResponseをパースできる', () => {
      const response: UpdatePersonResponse = {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '田中花子',
          gender: 'female',
          birthDate: '1990-05-15',
          birthPlace: '大阪府',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        },
      }

      const result = UpdatePersonResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('PaginationMetaSchema', () => {
    describe('正常系', () => {
      it('有効なページネーションメタデータをパースできる', () => {
        const meta: PaginationMeta = {
          total: 100,
          page: 1,
          perPage: 20,
          totalPages: 5,
        }

        const result = PaginationMetaSchema.safeParse(meta)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(meta)
        }
      })
    })

    describe('異常系', () => {
      it('totalが負の数の場合、パースに失敗する', () => {
        const meta = {
          total: -1,
          page: 1,
          perPage: 20,
          totalPages: 5,
        }

        const result = PaginationMetaSchema.safeParse(meta)
        expect(result.success).toBe(false)
      })

      it('pageが0の場合、パースに失敗する', () => {
        const meta = {
          total: 100,
          page: 0,
          perPage: 20,
          totalPages: 5,
        }

        const result = PaginationMetaSchema.safeParse(meta)
        expect(result.success).toBe(false)
      })

      it('perPageが負の数の場合、パースに失敗する', () => {
        const meta = {
          total: 100,
          page: 1,
          perPage: -1,
          totalPages: 5,
        }

        const result = PaginationMetaSchema.safeParse(meta)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('ListPersonsResponseSchema', () => {
    it('有効なListPersonsResponseをパースできる', () => {
      const response: ListPersonsResponse = {
        data: {
          items: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: '田中太郎',
              gender: 'male',
              birthDate: '1990-05-15',
              birthPlace: '東京都',
              createdAt: new Date('2024-01-01T00:00:00Z'),
              updatedAt: new Date('2024-01-02T00:00:00Z'),
            },
            {
              id: '223e4567-e89b-12d3-a456-426614174001',
              name: '田中花子',
              gender: 'female',
              birthDate: '1992-03-20',
              birthPlace: '大阪府',
              createdAt: new Date('2024-01-01T00:00:00Z'),
              updatedAt: new Date('2024-01-02T00:00:00Z'),
            },
          ],
          meta: {
            total: 2,
            page: 1,
            perPage: 20,
            totalPages: 1,
          },
        },
      }

      const result = ListPersonsResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('空の配列でもパースできる', () => {
      const response: ListPersonsResponse = {
        data: {
          items: [],
          meta: {
            total: 0,
            page: 1,
            perPage: 20,
            totalPages: 0,
          },
        },
      }

      const result = ListPersonsResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('itemsが欠けている場合、パースに失敗する', () => {
      const invalidResponse = {
        data: {
          meta: {
            total: 0,
            page: 1,
            perPage: 20,
            totalPages: 0,
          },
        },
      }

      const result = ListPersonsResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })

    it('metaが欠けている場合、パースに失敗する', () => {
      const invalidResponse = {
        data: {
          items: [],
        },
      }

      const result = ListPersonsResponseSchema.safeParse(invalidResponse)
      expect(result.success).toBe(false)
    })
  })

  describe('型の互換性確認', () => {
    it('既存のPerson型との互換性がある', () => {
      const person: Person = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '田中太郎',
        gender: 'male',
        birthDate: '1990-05-15',
        birthPlace: '東京都',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      }
      expect(person.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(person.name).toBe('田中太郎')
    })
  })
})
