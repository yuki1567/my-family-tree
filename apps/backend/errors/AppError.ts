export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errorCode: string = 'UNEXPECTED_ERROR'
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message, 500, 'DATABASE_ERROR')
  }
}
