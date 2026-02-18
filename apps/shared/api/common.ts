import { z } from 'zod'

export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'INTERNAL_ERROR',
  'DATABASE_ERROR',
  'UNKNOWN_ERROR',
])

export type ErrorCode = z.infer<typeof ErrorCodeSchema>

export const ValidationErrorCodeSchema = z.enum([
  'NAME_TOO_LONG',
  'INVALID_GENDER',
  'INVALID_DATE_FORMAT',
  'DEATH_BEFORE_BIRTH',
  'BIRTH_PLACE_TOO_LONG',
])

export type ValidationErrorCode = z.infer<typeof ValidationErrorCodeSchema>

export const HttpStatusCodeSchema = z.union([
  z.literal(200),
  z.literal(201),
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(500),
])

export type HttpStatusCode = z.infer<typeof HttpStatusCodeSchema>

export const ErrorDetailSchema = z.object({
  field: z.string(),
  code: z.string(),
})

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>

export const ErrorResponseSchema = z.object({
  errorCode: ErrorCodeSchema,
  details: z.array(ErrorDetailSchema).optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: dataSchema,
  })

export type ApiSuccessResponse<T> = {
  data: T
}

export const ApiErrorResponseSchema = z.object({
  error: ErrorResponseSchema,
})

export type ApiErrorResponse = {
  error: ErrorResponse
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
