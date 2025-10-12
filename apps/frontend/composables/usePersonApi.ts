import type { Person, PersonForm } from '@/types/person'
import type { ErrorResponse } from '@shared/api/common'
import type { PersonResponse } from '@shared/api/persons'

import { ApiErrorResponseSchema } from '@shared/api/common'
import { CreatePersonResponseSchema } from '@shared/api/persons'

import { useApi } from './useApi'

const convertGenderToNumber = (
  gender: 'male' | 'female' | 'unknown'
): 0 | 1 | 2 => {
  if (gender === 'male') return 1
  if (gender === 'female') return 2
  return 0
}

const convertGenderToString = (
  gender: 0 | 1 | 2
): 'male' | 'female' | 'unknown' => {
  if (gender === 1) return 'male'
  if (gender === 2) return 'female'
  return 'unknown'
}

const convertApiResponseToPerson = (response: PersonResponse): Person => {
  return {
    id: response.id,
    name: response.name ?? '',
    gender: convertGenderToString(response.gender),
    birthDate: response.birthDate ?? '',
    deathDate: response.deathDate ?? '',
    birthPlace: response.birthPlace ?? '',
  }
}

export const usePersonApi = () => {
  const createPerson = async (
    formData: PersonForm
  ): Promise<{ data: Person } | { error: ErrorResponse }> => {
    const requestBody = {
      ...formData,
      gender: convertGenderToNumber(formData.gender),
    }

    const response = await useApi('/api/people', {
      method: 'POST',
      body: requestBody,
    })

    const successResult = CreatePersonResponseSchema.safeParse(response)
    if (successResult.success) {
      const { data: personResponse } = successResult.data
      return { data: convertApiResponseToPerson(personResponse) }
    }

    const errorResult = ApiErrorResponseSchema.safeParse(response)
    if (errorResult.success) {
      const { error: errorResponse } = errorResult.data
      return { error: errorResponse }
    }

    return {
      error: {
        statusCode: 500,
        errorCode: 'UNKNOWN_ERROR',
      },
    }
  }

  return {
    createPerson,
  }
}
