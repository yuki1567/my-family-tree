import { CreatePersonRequest } from '@/validations/personValidation'
import { PersonRepository } from '@/repositories/personRepository'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest) {
    return await this.personRepository.create(data)
  }
}