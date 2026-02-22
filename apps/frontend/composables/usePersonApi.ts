import type { Person, PersonForm } from '@/types/person'
import { useRpcClient } from './useRpcClient'

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

export const usePersonApi = () => {
  const client = useRpcClient()

  const createPerson = async (
    formData: PersonForm
  ): Promise<{ data: Person } | { error: { errorCode: string; details?: { field: string; code: string }[] } }> => {
    const requestBody = {
      ...formData,
      gender: convertGenderToNumber(formData.gender),
    }

    try {
      const response = await client.api.people.$post({
        json: requestBody,
      })

      const body = await response.json()

      if ('error' in body) {
        return { error: body.error }
      }

      return {
        data: {
          ...body.data,
          gender: convertGenderToString(body.data.gender),
        },
      }
    } catch {
      return {
        error: {
          errorCode: 'UNKNOWN_ERROR',
        },
      }
    }
  }

  return {
    createPerson,
  }
}
