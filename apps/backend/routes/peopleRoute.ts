import { zValidator } from '@hono/zod-validator'
import type { CreatePersonResponse } from '@shared/api/persons.js'
import { CreatePersonRequestSchema } from '@shared/api/persons.js'
import { Hono } from 'hono'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'

const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)

export const peopleRoutes = new Hono()

peopleRoutes.post(
  '/people',
  zValidator('json', CreatePersonRequestSchema),
  async (c) => {
    const validatedData = c.req.valid('json')
    const result = await personService.create(validatedData)

    return c.json<CreatePersonResponse>(
      {
        data: result,
      },
      201
    )
  }
)
