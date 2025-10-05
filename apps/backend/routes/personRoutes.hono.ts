import { PersonControllerHono } from '@/controllers/personController.hono.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'
import { createPersonSchema } from '@/validations/personValidation.js'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

// 依存性注入でインスタンス作成
const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)
const personController = new PersonControllerHono(personService)

export const personRoutesHono = new Hono()

personRoutesHono.post(
  '/people',
  zValidator('json', createPersonSchema),
  (c) => personController.create(c)
)
