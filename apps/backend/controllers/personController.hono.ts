import { PersonService } from '@/services/personService.js'
import { CreatePersonRequest } from '@/validations/personValidation.js'
import { Context } from 'hono'

export class PersonControllerHono {
  constructor(private personService: PersonService) {}

  async create(c: Context) {
    const validatedData = c.req.valid('json') as CreatePersonRequest
    const result = await this.personService.create(validatedData)

    return c.json(
      {
        data: result,
      },
      201
    )
  }
}
