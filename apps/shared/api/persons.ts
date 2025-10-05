import { z } from 'zod'
import { ApiSuccessResponseSchema } from './common.js'

export const GenderSchema = z.enum(['male', 'female', 'unknown'])

export type Gender = z.infer<typeof GenderSchema>

const dateValidationRefine = (data: {
  birthDate?: string
  deathDate?: string
}) => {
  if (data.birthDate && data.deathDate) {
    return new Date(data.deathDate) >= new Date(data.birthDate)
  }
  return true
}

export const PersonSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().max(100).optional(),
    gender: GenderSchema.optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    deathDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    birthPlace: z.string().max(200).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .refine(dateValidationRefine, { path: ['deathDate'] })

export type Person = z.infer<typeof PersonSchema>

export const CreatePersonRequestSchema = z
  .object({
    name: z.string().max(100).optional(),
    gender: GenderSchema.optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    deathDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    birthPlace: z.string().max(200).optional(),
  })
  .refine(dateValidationRefine, { path: ['deathDate'] })

export type CreatePersonRequest = z.infer<typeof CreatePersonRequestSchema>

export const PersonResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100).optional(),
  gender: GenderSchema.optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  deathDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birthPlace: z.string().max(200).optional(),
})

export type PersonResponse = z.infer<typeof PersonResponseSchema>

export const CreatePersonResponseSchema =
  ApiSuccessResponseSchema(PersonResponseSchema)

export type CreatePersonResponse = z.infer<typeof CreatePersonResponseSchema>
