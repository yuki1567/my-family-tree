import { prisma } from '@/database/connection.js'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
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

    return {
      id: person.id,
      name: person.name ?? undefined,
      gender: person.gender,
      birthDate: formatDateToYYYYMMDD(person.birthDate) ?? undefined,
      deathDate: formatDateToYYYYMMDD(person.deathDate) ?? undefined,
      birthPlace: person.birthPlace ?? undefined,
    }
  }
}
