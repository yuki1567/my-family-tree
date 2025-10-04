export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public errorCode = 'UNKNOWN_ERROR'
  ) {
    super(message)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR')
  }
}
