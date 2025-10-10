import { z } from 'zod'

import { ApiSuccessResponseSchema } from './common.js'

const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/

const isValidDateString = (dateStr: string): boolean => {
  if (!dateStringRegex.test(dateStr)) return false

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false

  return dateStr === date.toISOString().split('T')[0]
}

const dateValidationRefine = (data: {
  birthDate?: string
  deathDate?: string
}) => {
  if (data.birthDate && data.deathDate) {
    return data.birthDate <= data.deathDate
  }
  return true
}

export const CreatePersonRequestSchema = z
  .object({
    name: z.string().max(100, { message: 'NAME_TOO_LONG' }).optional(),
    gender: z
      .union([z.literal(0), z.literal(1), z.literal(2)], {
        message: 'INVALID_GENDER',
      })
      .optional(),
    birthDate: z
      .string()
      .refine(isValidDateString, {
        message: 'INVALID_DATE_FORMAT',
      })
      .optional(),
    deathDate: z
      .string()
      .refine(isValidDateString, {
        message: 'INVALID_DATE_FORMAT',
      })
      .optional(),
    birthPlace: z
      .string()
      .max(200, { message: 'BIRTH_PLACE_TOO_LONG' })
      .optional(),
  })
  .refine(dateValidationRefine, {
    message: 'DEATH_BEFORE_BIRTH',
    path: ['deathDate'],
  })

export type CreatePersonRequest = z.infer<typeof CreatePersonRequestSchema>

export const PersonResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().max(100).optional(),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  birthDate: z.string().refine(isValidDateString).optional(),
  deathDate: z.string().refine(isValidDateString).optional(),
  birthPlace: z.string().max(200).optional(),
})

export type PersonResponse = z.infer<typeof PersonResponseSchema>

export const CreatePersonResponseSchema =
  ApiSuccessResponseSchema(PersonResponseSchema)

export type CreatePersonResponse = z.infer<typeof CreatePersonResponseSchema>
