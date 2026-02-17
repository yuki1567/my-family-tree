import type { ErrorResponse } from '@shared/api/common'
import { ApiErrorResponseSchema } from '@shared/api/common'
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
  ): Promise<{ data: Person } | { error: ErrorResponse }> => {
    const requestBody = {
      ...formData,
      gender: convertGenderToNumber(formData.gender),
    }

    try {
      const response = await client.api.people.$post({
        json: requestBody,
      })

      if (!response.ok) {
        const errorBody = await response.json()
        const errorResult = ApiErrorResponseSchema.safeParse(errorBody)
        if (errorResult.success) {
          return { error: errorResult.data.error }
        }

        return {
          error: {
            statusCode: 500,
            errorCode: 'UNKNOWN_ERROR',
          },
        }
      }

      const body = await response.json()
      return {
        data: {
          ...body.data,
          gender: convertGenderToString(body.data.gender),
        },
      }
    } catch {
      return {
        error: {
          statusCode: 500,
          errorCode: 'UNKNOWN_ERROR',
        },
      }
    }
  }

  return {
    createPerson,
  }
}
