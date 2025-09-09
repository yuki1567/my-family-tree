import { describe, it, expect, jest } from '@jest/globals'
import { PersonService } from '@/services/personService'
import { PersonRepository } from '@/repositories/personRepository'
import { CreatePersonRequest } from '@/validations/personValidation'

jest.mock('@/repositories/personRepository')

describe('PersonService', () => {
  const createMockRepository = () =>
    ({
      create: jest.fn(),
    }) as jest.Mocked<PersonRepository>

  describe('create', () => {
    it('有効なデータの場合、人物を作成できるか', async () => {
      const mockRepository = createMockRepository()
      const personService = new PersonService(mockRepository)

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
        gender: 2,
        birthDate: '1985-05-15',
        deathDate: '2020-12-31',
        birthPlace: '東京都',
      }

      mockRepository.create.mockResolvedValue(expectedResult)

      const result = await personService.create(createPersonData)

      expect(mockRepository.create).toHaveBeenCalledWith(createPersonData)
      expect(mockRepository.create).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResult)
    })

    it('最小限のデータの場合、人物を作成できるか', async () => {
      const mockRepository = createMockRepository()
      const personService = new PersonService(mockRepository)

      const createPersonData: CreatePersonRequest = {
        gender: 0,
      }

      const expectedResult = {
        id: 'test-uuid-2',
        name: null,
        gender: 0,
        birthDate: null,
        deathDate: null,
        birthPlace: null,
      }

      mockRepository.create.mockResolvedValue(expectedResult)

      const result = await personService.create(createPersonData)

      expect(mockRepository.create).toHaveBeenCalledWith(createPersonData)
      expect(result).toEqual(expectedResult)
    })

    it('Repository でエラーが発生した場合、エラーを伝播するか', async () => {
      const mockRepository = createMockRepository()
      const personService = new PersonService(mockRepository)

      const createPersonData: CreatePersonRequest = {
        name: 'エラーテスト',
        gender: 1,
      }

      const repositoryError = new Error('Database connection failed')
      mockRepository.create.mockRejectedValue(repositoryError)

      await expect(personService.create(createPersonData)).rejects.toThrow(
        'Database connection failed',
      )
      expect(mockRepository.create).toHaveBeenCalledWith(createPersonData)
    })
  })
})
