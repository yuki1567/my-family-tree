import { PersonRepository } from '@/repositories/personRepository.js'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest): Promise<PersonResponse> {
    return await this.personRepository.create(data)
  }
}
