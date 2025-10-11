import { prisma } from '@/database/connection.js'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import { toGender } from '@/utils/genderUtils.js'
import type {
  CreatePersonRequest,
  PersonResponse,
} from '@shared/api/persons.js'

export class PersonRepository {
  async create(data: CreatePersonRequest): Promise<PersonResponse> {
    const personData = {
      name: data.name ?? null,
      gender: data.gender,
      birthDate: convertStringToDate(data.birthDate),
      deathDate: convertStringToDate(data.deathDate),
      birthPlace: data.birthPlace ?? null,
    }

    const person = await prisma.people.create({
      data: personData,
    })

    const result: PersonResponse = {
      id: person.id,
      name: person.name ?? undefined,
      gender: toGender(person.gender),
      birthDate: formatDateToYYYYMMDD(person.birthDate) ?? undefined,
      deathDate: formatDateToYYYYMMDD(person.deathDate) ?? undefined,
      birthPlace: person.birthPlace ?? undefined,
    }

    return result
  }
}
