import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import {
  CreatePersonRequestSchema,
  CreatePersonResponseSchema,
} from '@shared/api/persons.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'

const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)

const createPersonRoute = createRoute({
  method: 'post',
  path: '/people',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePersonRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: CreatePersonResponseSchema,
        },
      },
      description: '人物作成成功',
    },
  },
})

const app = new OpenAPIHono()

export const peopleRoutes = app.openapi(createPersonRoute, async (c) => {
  const validatedData = c.req.valid('json')
  const result = await personService.create(validatedData)

  return c.json(
    {
      data: result,
    },
    201
  )
})
