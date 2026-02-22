import { Hono } from 'hono'
import { ErrorCodeSchema } from '@shared/api/common.js'
import { CreatePersonRequestSchema } from '@shared/api/persons.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'

const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)

const app = new Hono()

export const peopleRoutes = app.post('/people', async (c) => {
  const body = await c.req.json()
  const parsed = CreatePersonRequestSchema.safeParse(body)

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.map(String).join('.'),
      code: issue.message,
    }))
    return c.json({ error: { errorCode: ErrorCodeSchema.enum.VALIDATION_ERROR, details } }, 400)
  }

  const result = await personService.create(parsed.data)
  return c.json({ data: result }, 201)
})
