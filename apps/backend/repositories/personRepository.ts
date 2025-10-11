import { db } from '@/database/client.js'
import { people } from '@/database/schema/index.js'
import { DatabaseError } from '@/errors/AppError.js'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

export class PersonRepository {
  public async create(data: CreatePersonRequest): Promise<PersonResponse> {
    const [person] = await db
      .insert(people)
      .values({
        name: data.name ?? null,
        gender: data.gender ?? 0,
        birthDate: convertStringToDate(data.birthDate),
        deathDate: convertStringToDate(data.deathDate),
        birthPlace: data.birthPlace ?? null,
      })
      .returning()

    if (!person) {
      throw new DatabaseError('Failed to create person record')
    }

    if (!this.isValidGender(person.gender)) {
      throw new DatabaseError(
        `Invalid gender value from database: ${person.gender}. Expected 0, 1, 2.`
      )
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

  private isValidGender(value: number): value is 0 | 1 | 2 {
    return value === 0 || value === 1 || value === 2
  }
}
