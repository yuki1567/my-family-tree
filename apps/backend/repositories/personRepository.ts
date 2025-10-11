import { prisma } from '@/database/connection.js'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

function isValidGender(value: number): value is 0 | 1 | 2 {
  return value === 0 || value === 1 || value === 2
}

export class PersonRepository {
  async create(data: CreatePersonRequest): Promise<PersonResponse> {
    const person = await prisma.people.create({
      data: {
        name: data.name ?? null,
        gender: data.gender ?? 0,
        birthDate: convertStringToDate(data.birthDate),
        deathDate: convertStringToDate(data.deathDate),
        birthPlace: data.birthPlace ?? null,
      },
    })

    if (!isValidGender(person.gender)) {
      throw new Error(
        `Invalid gender value from database: ${person.gender}. Expected 0, 1, or 2.`
      )
    }

    const result = {
      id: person.id,
      name: person.name ?? undefined,
      gender: person.gender,
      birthDate: formatDateToYYYYMMDD(person.birthDate) ?? undefined,
      deathDate: formatDateToYYYYMMDD(person.deathDate) ?? undefined,
      birthPlace: person.birthPlace ?? undefined,
    } satisfies PersonResponse

    return result
  }
}
