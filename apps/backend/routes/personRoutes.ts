import { PersonController } from '@/controllers/personController.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'
import { createPersonSchema } from '@/validations/personValidation.js'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)
const personController = new PersonController(personService)

export const personRoutes = new Hono()

personRoutes.post('/people', zValidator('json', createPersonSchema), (c) =>
  personController.create(c)
)
