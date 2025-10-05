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

const dateValidationRefineConfig = {
  message: 'Death date must be after or equal to birth date',
  path: ['deathDate'],
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
  .refine(dateValidationRefine, dateValidationRefineConfig)

export type Person = z.infer<typeof PersonSchema>

export const CreatePersonRequestSchema = z
  .object({
    name: z.string().max(100).optional(),
    gender: GenderSchema.optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    deathDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    birthPlace: z.string().max(200).optional(),
  })
  .refine(dateValidationRefine, dateValidationRefineConfig)

export type CreatePersonRequest = z.infer<typeof CreatePersonRequestSchema>

export const CreatePersonResponseSchema =
  ApiSuccessResponseSchema(PersonSchema)

export type CreatePersonResponse = z.infer<typeof CreatePersonResponseSchema>

export const UpdatePersonRequestSchema = CreatePersonRequestSchema.partial()

export type UpdatePersonRequest = z.infer<typeof UpdatePersonRequestSchema>

export const UpdatePersonResponseSchema =
  ApiSuccessResponseSchema(PersonSchema)

export type UpdatePersonResponse = z.infer<typeof UpdatePersonResponseSchema>

export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
})

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

export const ListPersonsResponseSchema = ApiSuccessResponseSchema(
  z.object({
    items: z.array(PersonSchema),
    meta: PaginationMetaSchema,
  })
)

export type ListPersonsResponse = z.infer<typeof ListPersonsResponseSchema>
