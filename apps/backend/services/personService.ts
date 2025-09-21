import { PersonRepository } from '@/repositories/personRepository.js'
import { CreatePersonRequest } from '@/validations/personValidation.js'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest) {
    return await this.personRepository.create(data)
  }
}
