export type ErrorDetail = {
  field: string
  code: string
}

export type ErrorResponse = {
  statusCode: number
  errorCode: string
  details?: ErrorDetail[]
}

export type ApiSuccessResponse<T> = {
  isSuccess: true
  data: T
}

export type ApiErrorResponse = {
  isSuccess: false
  error: ErrorResponse
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'DATABASE_ERROR'
  | 'UNEXPECTED_ERROR'

export type ValidationErrorCode =
  | 'NAME_TOO_LONG'
  | 'INVALID_GENDER'
  | 'INVALID_DATE_FORMAT'
  | 'DEATH_BEFORE_BIRTH'
  | 'BIRTH_PLACE_TOO_LONG'