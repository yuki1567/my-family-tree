import { DatabaseError } from '@/errors/AppError.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest): Promise<PersonResponse> {
    try {
      return await this.personRepository.create(data)
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientUnknownRequestError ||
        error instanceof PrismaClientInitializationError
      ) {
        throw new DatabaseError('データベース操作中にエラーが発生しました')
      }

      throw error
    }
  }
}
