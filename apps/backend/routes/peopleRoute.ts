import { DatabaseError } from '@/errors/AppError.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'
import { zValidator } from '@hono/zod-validator'
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library'
import type { CreatePersonResponse } from '@shared/api/persons.js'
import { CreatePersonRequestSchema } from '@shared/api/persons.js'
import { Hono } from 'hono'

const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)

export const peopleRoutes = new Hono()

peopleRoutes.post(
  '/people',
  zValidator('json', CreatePersonRequestSchema),
  async (c) => {
    try {
      const validatedData = c.req.valid('json')
      const result = await personService.create(validatedData)

      return c.json<CreatePersonResponse>(
        {
          data: result,
        },
        201
      )
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientUnknownRequestError ||
        error instanceof PrismaClientInitializationError
      ) {
        throw new DatabaseError('データベース操作中にエラーが発生しました')
      }

      throw error
    }
  }
)
