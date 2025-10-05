import { PersonService } from '@/services/personService.js'
import { Handler } from 'hono'

export function createPersonControllerHono(personService: PersonService) {
  const create: Handler = async (c) => {
    const validatedData = await c.req.json()
    const result = await personService.create(validatedData)

    return c.json(
      {
        data: result,
      },
      201
    )
  }

  return {
    create,
  }
}
