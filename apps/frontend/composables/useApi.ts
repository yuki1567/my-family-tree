import type { ApiResponse } from '@shared/api/common'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type UseApiOptions = {
  method?: HttpMethod
  body?: Record<string, unknown> | string
  headers?: Record<string, string>
}

export const useApi = async <T>(
  url: string,
  options: UseApiOptions = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', body, headers = {} } = options

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  try {
    const requestOptions: RequestInit = {
      method,
      headers: defaultHeaders,
    }

    if (
      body &&
      (method === 'POST' || method === 'PUT' || method === 'DELETE')
    ) {
      requestOptions.body =
        typeof body === 'string' ? body : JSON.stringify(body)
    }

    const response = await fetch(url, requestOptions)
    return await response.json()
  } catch {
    return {
      error: {
        statusCode: 500,
        errorCode: 'UNKNOWN_ERROR',
      },
    }
  }
}
