import { ref, type Ref } from 'vue'
import type { ApiResponse } from '../../shared/types/response'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface UseApiOptions {
  method?: HttpMethod
  body?: Record<string, unknown> | string
  headers?: Record<string, string>
  immediate?: boolean
}

export interface UseApiReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: () => Promise<T | null>
}

export function useApi<T = unknown>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    immediate = false,
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const execute = async (): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const requestOptions: RequestInit = {
        method,
        headers: defaultHeaders,
      }

      if (body && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
      }

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        try {
          const result: ApiResponse<T> = await response.json()
          if ('error' in result && result.error) {
            error.value = result.error.errorCode
          } else {
            error.value = `HTTP error! status: ${response.status}`
          }
        } catch {
          error.value = `HTTP error! status: ${response.status}`
        }
        return null
      }

      const result: ApiResponse<T> = await response.json()

      if (result.isSuccess) {
        data.value = result.data
        return result.data
      } else {
        error.value = result.error.errorCode
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
  }
}