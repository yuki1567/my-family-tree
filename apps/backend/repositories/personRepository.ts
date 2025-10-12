import { db } from '@/database/client.js'
import { people } from '@/database/schema.js'
import { DatabaseError } from '@/errors/AppError.js'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

export class PersonRepository {
  public async create(data: CreatePersonRequest): Promise<PersonResponse> {
    const [person] = await db.insert(people).values(data).returning()

    if (!person) {
      throw new DatabaseError('データベースに値が作成されていません')
    }

    const result = {
      id: person.id,
      name: person.name ?? undefined,
      gender: person.gender,
      birthDate: person.birthDate ?? undefined,
      deathDate: person.deathDate ?? undefined,
      birthPlace: person.birthPlace ?? undefined,
    } satisfies PersonResponse

    return result
  }
}
