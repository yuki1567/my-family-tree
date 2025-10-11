import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'
import type { CreatePersonRequest } from '@shared/api/persons.js'
import { describe, expect, it, vi } from 'vitest'

describe('PersonService', () => {
  const createMockRepository = () => {
    return {
      create: vi.fn<PersonRepository['create']>(),
    }
  }

  const setup = () => {
    const repository = createMockRepository()
    const service = new PersonService(repository as unknown as PersonRepository)

    return { repository, service }
  }

  describe('create', () => {
    it('有効なデータの場合、人物を作成できるか', async () => {
      const { repository, service } = setup()

      const createPersonData: CreatePersonRequest = {
        name: '田中花子',
        gender: 2,
        birthDate: '1985-05-15',
        deathDate: '2020-12-31',
        birthPlace: '東京都',
      }

      const expectedResult = {
        id: 'test-uuid',
        name: '田中花子',
        gender: 2 as const,
        birthDate: '1985-05-15',
        deathDate: '2020-12-31',
        birthPlace: '東京都',
      }

      repository.create.mockResolvedValue(expectedResult)

      const result = await service.create(createPersonData)

      expect(repository.create).toHaveBeenCalledWith(createPersonData)
      expect(repository.create).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResult)
    })

    it('最小限のデータの場合、人物を作成できるか', async () => {
      const { repository, service } = setup()

      const createPersonData: CreatePersonRequest = {
        gender: 0,
      }

      const expectedResult = {
        id: 'test-uuid-2',
        name: undefined,
        gender: 0 as const,
        birthDate: undefined,
        deathDate: undefined,
        birthPlace: undefined,
      }

      repository.create.mockResolvedValue(expectedResult)

      const result = await service.create(createPersonData)

      expect(repository.create).toHaveBeenCalledWith(createPersonData)
      expect(result).toEqual(expectedResult)
    })

    it('Repository でエラーが発生した場合、エラーを伝播するか', async () => {
      const { repository, service } = setup()

      const createPersonData: CreatePersonRequest = {
        name: 'エラーテスト',
        gender: 1,
      }

      const repositoryError = new Error('Database connection failed')
      repository.create.mockRejectedValue(repositoryError)

      await expect(service.create(createPersonData)).rejects.toThrow(
        'Database connection failed'
      )
      expect(repository.create).toHaveBeenCalledWith(createPersonData)
    })
  })
})
