import type { Person, PersonForm } from '@/types/person'
import type { ApiSuccessResponse, ErrorResponse } from '@shared/api/common'
import type { CreatePersonResponse, PersonResponse } from '@shared/api/persons'

import { useApi } from './useApi'

const isSuccessResponse = (
  response: unknown
): response is ApiSuccessResponse<PersonResponse> => {
  return (
    response !== null &&
    typeof response === 'object' &&
    'data' in response &&
    response.data !== null &&
    typeof response.data === 'object' &&
    'id' in response.data &&
    'gender' in response.data
  )
}

const isErrorResponse = (
  response: unknown
): response is { error: ErrorResponse } => {
  return (
    response !== null &&
    typeof response === 'object' &&
    'error' in response &&
    response.error !== null &&
    typeof response.error === 'object' &&
    'statusCode' in response.error &&
    'errorCode' in response.error
  )
}

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

    console.log('Sending request:', requestBody)
    const response = await useApi<CreatePersonResponse>('/api/people', {
      method: 'POST',
      body: requestBody,
    })
    console.log('Received response:', response)

    if (isSuccessResponse(response)) {
      return { data: convertApiResponseToPerson(response.data) }
    }

    if (isErrorResponse(response)) {
      return { error: response.error }
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
