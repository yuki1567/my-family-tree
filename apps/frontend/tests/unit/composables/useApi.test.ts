import { describe, expect, it, beforeEach, vi, type MockedFunction } from 'vitest'
import { useApi } from '../../../composables/useApi'
import type { ApiResponse } from '../../../../shared/types/response'

describe('useApi Composable', () => {
  let mockFetch: MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('基本機能テスト', () => {
    it('正常なGETリクエストの処理', async () => {
      const mockData = { id: '1', name: 'Test Person' }
      const mockResponse: ApiResponse<typeof mockData> = {
        isSuccess: true,
        data: mockData,
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { data, loading, error, execute } = useApi<typeof mockData>('/api/people')

      expect(data.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()

      const result = await execute()

      expect(result).toEqual(mockData)
      expect(data.value).toEqual(mockData)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith('/api/people', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('POSTリクエストでbodyを送信', async () => {
      const requestData = { name: 'New Person', gender: 'male' }
      const responseData = { id: '1', ...requestData }
      const mockResponse: ApiResponse<typeof responseData> = {
        isSuccess: true,
        data: responseData,
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { execute } = useApi('/api/people', {
        method: 'POST',
        body: requestData,
      })

      const result = await execute()

      expect(result).toEqual(responseData)
      expect(mockFetch).toHaveBeenCalledWith('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
    })

    it('immediate: trueの場合は自動実行', async () => {
      const mockData = { id: '1', name: 'Test Person' }
      const mockResponse: ApiResponse<typeof mockData> = {
        isSuccess: true,
        data: mockData,
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      useApi('/api/people', { immediate: true })

      expect(mockFetch).toHaveBeenCalledOnce()
    })
  })

  describe('エラーハンドリング', () => {
    it('APIエラーレスポンスの処理', async () => {
      const mockErrorResponse: ApiResponse<never> = {
        isSuccess: false,
        error: {
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
        },
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockErrorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { data, error, execute } = useApi('/api/people')

      const result = await execute()

      expect(result).toBeNull()
      expect(data.value).toBeNull()
      expect(error.value).toBe('VALIDATION_ERROR')
    })

    it('HTTPエラーステータスの処理', async () => {
      mockFetch.mockResolvedValue(
        new Response('Not Found', { status: 404 })
      )

      const { data, error, execute } = useApi('/api/people')

      const result = await execute()

      expect(result).toBeNull()
      expect(data.value).toBeNull()
      expect(error.value).toBe('HTTP error! status: 404')
    })

    it('ネットワークエラーの処理', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { data, error, execute } = useApi('/api/people')

      const result = await execute()

      expect(result).toBeNull()
      expect(data.value).toBeNull()
      expect(error.value).toBe('Network error')
    })
  })

  describe('HTTPメソッド別テスト', () => {
    it('PUTリクエストの処理', async () => {
      const requestData = { name: 'Updated Person' }
      const responseData = { id: '1', ...requestData }
      const mockResponse: ApiResponse<typeof responseData> = {
        isSuccess: true,
        data: responseData,
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { execute } = useApi('/api/people/1', {
        method: 'PUT',
        body: requestData,
      })

      await execute()

      expect(mockFetch).toHaveBeenCalledWith('/api/people/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
    })

    it('DELETEリクエストの処理', async () => {
      const mockResponse: ApiResponse<{ message: string }> = {
        isSuccess: true,
        data: { message: 'Deleted successfully' },
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { execute } = useApi('/api/people/1', { method: 'DELETE' })

      const result = await execute()

      expect(result).toEqual({ message: 'Deleted successfully' })
      expect(mockFetch).toHaveBeenCalledWith('/api/people/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    })
  })

  describe('ローディング状態管理', () => {
    it('execute実行中はloading状態がtrueになる', async () => {
      let resolvePromise: (value: Response) => void
      const promise = new Promise<Response>((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValue(promise)

      const { loading, execute } = useApi('/api/people')

      expect(loading.value).toBe(false)

      const executePromise = execute()
      expect(loading.value).toBe(true)

      resolvePromise!(
        new Response(JSON.stringify({ isSuccess: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      await executePromise
      expect(loading.value).toBe(false)
    })
  })

  describe('カスタムヘッダー', () => {
    it('カスタムヘッダーが適用される', async () => {
      const mockResponse: ApiResponse<{}> = {
        isSuccess: true,
        data: {},
      }

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { execute } = useApi('/api/people', {
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      })

      await execute()

      expect(mockFetch).toHaveBeenCalledWith('/api/people', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      })
    })
  })
})