import { PersonService } from '@/services/personService.js'
import type { Context } from 'hono'

export class PersonController {
  constructor(private personService: PersonService) {}

  async create(c: Context): Promise<Response> {
    const validatedData = await c.req.json()
    const result = await this.personService.create(validatedData)

    return c.json(
      {
        data: result,
      },
      201
    )
  }
}
