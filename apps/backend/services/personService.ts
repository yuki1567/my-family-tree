import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'
import type { PersonRepository } from '@/repositories/personRepository.js'

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest): Promise<PersonResponse> {
    return await this.personRepository.create(data)
  }
}
