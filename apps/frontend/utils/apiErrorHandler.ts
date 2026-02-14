import type {
  ApiErrorResponse,
  ErrorDetail,
  HttpStatusCode,
} from '@shared/api/common'

/**
 * API エラーハンドリングの結果型
 */
export type ApiErrorHandlingResult = {
  /** ユーザー向けのエラーメッセージ */
  message: string
  /** ユーザーに表示すべきかどうか */
  shouldShowToUser: boolean
  /** エラーの深刻度 */
  severity: 'low' | 'medium' | 'high'
}

/**
 * APIエラーの型
 */
export type ApiError = {
  status: HttpStatusCode
  message?: string
  response?: ApiErrorResponse
}

/**
 * HTTPステータスコードに基づくエラー分類
 */
const ERROR_CLASSIFICATIONS: Record<
  HttpStatusCode,
  { severity: ApiErrorHandlingResult['severity']; defaultMessage: string }
> = {
  200: { severity: 'low', defaultMessage: '成功しました' },
  201: { severity: 'low', defaultMessage: '作成されました' },
  400: { severity: 'medium', defaultMessage: '入力内容に誤りがあります' },
  401: { severity: 'high', defaultMessage: '認証が必要です' },
  403: { severity: 'high', defaultMessage: 'アクセス権限がありません' },
  404: {
    severity: 'medium',
    defaultMessage: '要求されたデータが見つかりません',
  },
  500: {
    severity: 'high',
    defaultMessage:
      'サーバーエラーが発生しました。しばらくしてから再度お試しください',
  },
}

/**
 * エラーコードに対応する日本語メッセージ
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: '入力内容に誤りがあります',
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: 'アクセス権限がありません',
  NOT_FOUND: 'データが見つかりません',
  INTERNAL_ERROR: 'サーバーエラーが発生しました',
  DATABASE_ERROR: 'データベースエラーが発生しました',
  UNEXPECTED_ERROR: '予期しないエラーが発生しました',
  NAME_TOO_LONG: '名前が長すぎます',
  INVALID_GENDER: '性別の指定が不正です',
  INVALID_DATE_FORMAT: '日付の形式が不正です',
  DEATH_BEFORE_BIRTH: '死亡日が生年月日より前になっています',
  BIRTH_PLACE_TOO_LONG: '出生地が長すぎます',
}

/**
 * エラーメッセージを日本語に変換
 */
export function formatErrorMessage(
  status: HttpStatusCode,
  errorCode?: string
): string {
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    return ERROR_CODE_MESSAGES[errorCode]
  }

  return (
    ERROR_CLASSIFICATIONS[status]?.defaultMessage ||
    '不明なエラーが発生しました'
  )
}

/**
 * API エラーをハンドリングし、統一的な形式で返す
 */
export function handleApiError(error: ApiError): ApiErrorHandlingResult {
  const status = error.status
  const classification = ERROR_CLASSIFICATIONS[status]

  // デフォルト値
  let message = classification?.defaultMessage || '不明なエラーが発生しました'
  const severity = classification?.severity || 'high'
  const shouldShowToUser = status >= 400

  // エラーレスポンスから詳細メッセージを取得
  if (error.response?.error) {
    const errorResponse = error.response.error
    message = formatErrorMessage(status, errorResponse.errorCode)

    // バリデーションエラーの場合、詳細を含める
    if (errorResponse.details && errorResponse.details.length > 0) {
      const detailMessages = errorResponse.details
        .map((detail: ErrorDetail) => {
          const fieldMessage = ERROR_CODE_MESSAGES[detail.code] || detail.code
          return `${detail.field}: ${fieldMessage}`
        })
        .join(', ')
      message = `${message} (${detailMessages})`
    }
  } else if (error.message) {
    message = error.message
  }

  return {
    message,
    shouldShowToUser,
    severity,
  }
}

/**
 * API エラーをログに出力
 */
export function logApiError(
  error: ApiError,
  context: string,
  endpoint: string
): void {
  const { message, severity } = handleApiError(error)

  const logMessage = `[${severity.toUpperCase()}] API Error in ${context} - ${endpoint}: ${message}`

  if (severity === 'high') {
    // biome-ignore lint/suspicious/noConsole: エラーログ出力はアプリケーションの本番ログ機能として必要
    console.error(logMessage, error)
  } else if (severity === 'medium') {
    // biome-ignore lint/suspicious/noConsole: エラーログ出力はアプリケーションの本番ログ機能として必要
    console.warn(logMessage, error)
  } else {
    // biome-ignore lint/suspicious/noConsole: エラーログ出力はアプリケーションの本番ログ機能として必要
    console.log(logMessage, error)
  }

  if (error.response?.error) {
    // biome-ignore lint/suspicious/noConsole: エラー詳細のログ出力は本番ログ機能として必要
    console.error('Error details:', error.response.error)
  }
}

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: unknown): boolean {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ECONNREFUSED')
    )
  }
  return false
}

/**
 * ネットワークエラーのハンドリング
 */
export function handleNetworkError(): ApiErrorHandlingResult {
  return {
    message: 'ネットワークエラーが発生しました。接続を確認してください',
    shouldShowToUser: true,
    severity: 'high',
  }
}
