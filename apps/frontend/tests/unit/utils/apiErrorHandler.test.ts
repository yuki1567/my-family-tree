import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { HttpStatusCode } from '../../../../shared/types/response'
import type { ApiError } from '../../../utils/apiErrorHandler'
import {
  formatErrorMessage,
  handleApiError,
  logApiError,
  isNetworkError,
  handleNetworkError,
} from '../../../utils/apiErrorHandler'

describe('apiErrorHandler', () => {
  describe('formatErrorMessage', () => {
    it('エラーコードに対応する日本語メッセージを返す', () => {
      expect(formatErrorMessage(400, 'VALIDATION_ERROR')).toBe(
        '入力内容に誤りがあります',
      )
      expect(formatErrorMessage(401, 'UNAUTHORIZED')).toBe('認証が必要です')
      expect(formatErrorMessage(403, 'FORBIDDEN')).toBe(
        'アクセス権限がありません',
      )
      expect(formatErrorMessage(404, 'NOT_FOUND')).toBe(
        'データが見つかりません',
      )
      expect(formatErrorMessage(500, 'INTERNAL_ERROR')).toBe(
        'サーバーエラーが発生しました',
      )
    })

    it('エラーコードがない場合、ステータスコードに応じたデフォルトメッセージを返す', () => {
      expect(formatErrorMessage(400)).toBe('入力内容に誤りがあります')
      expect(formatErrorMessage(401)).toBe('認証が必要です')
      expect(formatErrorMessage(403)).toBe('アクセス権限がありません')
      expect(formatErrorMessage(404)).toBe('要求されたデータが見つかりません')
      expect(formatErrorMessage(500)).toBe(
        'サーバーエラーが発生しました。しばらくしてから再度お試しください',
      )
    })

    it('バリデーションエラーコードに対応するメッセージを返す', () => {
      expect(formatErrorMessage(400, 'NAME_TOO_LONG')).toBe(
        '名前が長すぎます',
      )
      expect(formatErrorMessage(400, 'INVALID_GENDER')).toBe(
        '性別の指定が不正です',
      )
      expect(formatErrorMessage(400, 'INVALID_DATE_FORMAT')).toBe(
        '日付の形式が不正です',
      )
      expect(formatErrorMessage(400, 'DEATH_BEFORE_BIRTH')).toBe(
        '死亡日が生年月日より前になっています',
      )
    })
  })

  describe('handleApiError', () => {
    it('400エラーを適切にハンドリングする', () => {
      const error: ApiError = {
        status: 400,
      }

      const result = handleApiError(error)

      expect(result.message).toBe('入力内容に誤りがあります')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('medium')
    })

    it('401エラーを適切にハンドリングする', () => {
      const error: ApiError = {
        status: 401,
      }

      const result = handleApiError(error)

      expect(result.message).toBe('認証が必要です')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('high')
    })

    it('403エラーを適切にハンドリングする', () => {
      const error: ApiError = {
        status: 403,
      }

      const result = handleApiError(error)

      expect(result.message).toBe('アクセス権限がありません')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('high')
    })

    it('404エラーを適切にハンドリングする', () => {
      const error: ApiError = {
        status: 404,
      }

      const result = handleApiError(error)

      expect(result.message).toBe('要求されたデータが見つかりません')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('medium')
    })

    it('500エラーを適切にハンドリングする', () => {
      const error: ApiError = {
        status: 500,
      }

      const result = handleApiError(error)

      expect(result.message).toBe(
        'サーバーエラーが発生しました。しばらくしてから再度お試しください',
      )
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('high')
    })

    it('エラーレスポンスからエラーコードを取得する', () => {
      const error: ApiError = {
        status: 400,
        response: {
          error: {
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
          },
        },
      }

      const result = handleApiError(error)

      expect(result.message).toBe('入力内容に誤りがあります')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('medium')
    })

    it('バリデーションエラーの詳細を含める', () => {
      const error: ApiError = {
        status: 400,
        response: {
          error: {
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            details: [
              { field: 'name', code: 'NAME_TOO_LONG' },
              { field: 'birthDate', code: 'INVALID_DATE_FORMAT' },
            ],
          },
        },
      }

      const result = handleApiError(error)

      expect(result.message).toContain('入力内容に誤りがあります')
      expect(result.message).toContain('name: 名前が長すぎます')
      expect(result.message).toContain('birthDate: 日付の形式が不正です')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('medium')
    })

    it('エラーメッセージを使用する', () => {
      const error: ApiError = {
        status: 500,
        message: 'カスタムエラーメッセージ',
      }

      const result = handleApiError(error)

      expect(result.message).toBe('カスタムエラーメッセージ')
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('high')
    })
  })

  describe('logApiError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('highレベルのエラーはconsole.errorで出力される', () => {
      const error: ApiError = {
        status: 500,
      }

      logApiError(error, 'PersonAPI', 'GET /api/people')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HIGH] API Error in PersonAPI - GET /api/people'),
        error,
      )
    })

    it('mediumレベルのエラーはconsole.warnで出力される', () => {
      const error: ApiError = {
        status: 400,
      }

      logApiError(error, 'PersonAPI', 'POST /api/people')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MEDIUM] API Error in PersonAPI - POST /api/people'),
        error,
      )
    })

    it('lowレベルのエラーはconsole.logで出力される', () => {
      const error: ApiError = {
        status: 200,
      }

      logApiError(error, 'PersonAPI', 'GET /api/people')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOW] API Error in PersonAPI - GET /api/people'),
        error,
      )
    })

    it('エラーレスポンスがある場合、詳細を出力する', () => {
      const error: ApiError = {
        status: 500,
        response: {
          error: {
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
          },
        },
      }

      logApiError(error, 'PersonAPI', 'GET /api/people')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error details:',
        error.response.error,
      )
    })
  })

  describe('isNetworkError', () => {
    it('Network Errorを検出する', () => {
      const error = new Error('Network Error occurred')
      expect(isNetworkError(error)).toBe(true)
    })

    it('Failed to fetchを検出する', () => {
      const error = new Error('Failed to fetch data')
      expect(isNetworkError(error)).toBe(true)
    })

    it('ECONNREFUSEDを検出する', () => {
      const error = new Error('ECONNREFUSED connection refused')
      expect(isNetworkError(error)).toBe(true)
    })

    it('ネットワークエラーでない場合はfalseを返す', () => {
      const error = new Error('Some other error')
      expect(isNetworkError(error)).toBe(false)
    })

    it('エラーオブジェクトでない場合はfalseを返す', () => {
      expect(isNetworkError('string error')).toBe(false)
      expect(isNetworkError(null)).toBe(false)
      expect(isNetworkError(undefined)).toBe(false)
      expect(isNetworkError(123)).toBe(false)
    })
  })

  describe('handleNetworkError', () => {
    it('ネットワークエラーのハンドリング結果を返す', () => {
      const result = handleNetworkError()

      expect(result.message).toBe(
        'ネットワークエラーが発生しました。接続を確認してください',
      )
      expect(result.shouldShowToUser).toBe(true)
      expect(result.severity).toBe('high')
    })
  })
})
