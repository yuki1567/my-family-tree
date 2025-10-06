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

export const PersonSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().max(100).optional(),
    gender: z.number().int().min(0).max(2).optional(),
    birthDate: z.string().refine(isValidDateString).optional(),
    deathDate: z.string().refine(isValidDateString).optional(),
    birthPlace: z.string().max(200).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .refine(dateValidationRefine, { path: ['deathDate'] })

export type Person = z.infer<typeof PersonSchema>

export const CreatePersonRequestSchema = z
  .object({
    name: z.string().max(100).optional(),
    gender: z.number().int().min(0).max(2).default(0),
    birthDate: z.string().refine(isValidDateString).optional(),
    deathDate: z.string().refine(isValidDateString).optional(),
    birthPlace: z.string().max(200).optional(),
  })
  .refine(dateValidationRefine, { path: ['deathDate'] })

export type CreatePersonRequest = z.infer<typeof CreatePersonRequestSchema>

export const PersonResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100).optional(),
  gender: z.number().int().min(0).max(2).optional(),
  birthDate: z.string().refine(isValidDateString).optional(),
  deathDate: z.string().refine(isValidDateString).optional(),
  birthPlace: z.string().max(200).optional(),
})

export type PersonResponse = z.infer<typeof PersonResponseSchema>

export const CreatePersonResponseSchema =
  ApiSuccessResponseSchema(PersonResponseSchema)

export type CreatePersonResponse = z.infer<typeof CreatePersonResponseSchema>
