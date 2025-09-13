import { PersonRepository } from '@/repositories/personRepository'
import { CreatePersonRequest } from '@/validations/personValidation'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest) {
    return await this.personRepository.create(data)
  }
}
