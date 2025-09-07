import { CreatePersonRequest } from '@/validations/personValidation'
import { personRepository } from '@/repositories/personRepository'

export const personService = {
  async create(data: CreatePersonRequest) {
    return await personRepository.create(data)
  }
}