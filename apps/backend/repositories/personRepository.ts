import { prisma } from '@/database/config/database.js'
import { convertStringToDate, formatDateToYYYYMMDD } from '@/utils/dateUtils.js'
import { CreatePersonRequest } from '@/validations/personValidation.js'

export class PersonRepository {
  async create(data: CreatePersonRequest) {
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
      name: person.name,
      gender: person.gender,
      birthDate: formatDateToYYYYMMDD(person.birthDate),
      deathDate: formatDateToYYYYMMDD(person.deathDate),
      birthPlace: person.birthPlace,
    }
  }
}
