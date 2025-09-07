import { prisma } from '@/database/config/database'
import { CreatePersonRequest } from '@/validations/personValidation'

const formatDate = (date: Date | null): string | null => {
  if (!date) return null
  const isoString = date.toISOString()
  const datePart = isoString.substring(0, 10)
  return datePart.replace(/-/g, '')
}

export function convertDateStringToDate(
  dateStr: string | undefined,
): Date | null {
  if (!dateStr) return null
  return new Date(dateStr)
}

export const personRepository = {
  async create(data: CreatePersonRequest) {
    const personData = {
      name: data.name ?? null,
      gender: data.gender,
      birthDate: convertDateStringToDate(data.birthDate),
      deathDate: convertDateStringToDate(data.deathDate),
      birthPlace: data.birthPlace ?? null,
    }

    const person = await prisma.people.create({
      data: personData,
    })

    return {
      id: person.id,
      name: person.name,
      gender: person.gender,
      birthDate: formatDate(person.birthDate),
      deathDate: formatDate(person.deathDate),
      birthPlace: person.birthPlace,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    }
  },
}
