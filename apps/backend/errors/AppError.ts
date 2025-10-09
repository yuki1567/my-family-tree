import type { ErrorCode, HttpStatusCode } from '@shared/api/common.js'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: HttpStatusCode,
    public errorCode: ErrorCode
  ) {
    super(message)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR')
  }
}
