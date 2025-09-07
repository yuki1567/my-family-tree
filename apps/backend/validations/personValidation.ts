import { z } from 'zod'

const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/

const isValidDateString = (dateStr: string): boolean => {
  if (!dateStringRegex.test(dateStr)) return false
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  
  return dateStr === date.toISOString().split('T')[0]
}

export const createPersonSchema = z
  .object({
    name: z
      .string()
      .max(100, { message: 'NAME_TOO_LONG' })
      .optional(),
    
    gender: z
      .number()
      .int()
      .min(0)
      .max(2)
      .default(0),
    
    birthDate: z
      .string()
      .refine(isValidDateString, {
        message: 'INVALID_DATE_FORMAT'
      })
      .optional(),
    
    deathDate: z
      .string()
      .refine(isValidDateString, {
        message: 'INVALID_DATE_FORMAT'
      })
      .optional(),
    
    birthPlace: z
      .string()
      .max(200, { message: 'BIRTH_PLACE_TOO_LONG' })
      .optional()
  })
  .refine(
    (data) => {
      if (data.birthDate && data.deathDate) {
        return data.birthDate <= data.deathDate
      }
      return true
    },
    {
      message: 'DEATH_BEFORE_BIRTH',
      path: ['deathDate']
    }
  )

export type CreatePersonRequest = z.infer<typeof createPersonSchema>