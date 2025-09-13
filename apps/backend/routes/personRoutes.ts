import { PersonController } from '@/controllers/personController'
import { validateBody } from '@/middlewares/validate'
import { PersonRepository } from '@/repositories/personRepository'
import { PersonService } from '@/services/personService'
import { createPersonSchema } from '@/validations/personValidation'
import { Router } from 'express'

// 依存性注入でインスタンス作成
const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)
const personController = new PersonController(personService)

export const personRoutes = Router()

personRoutes.post('/people', validateBody(createPersonSchema), (req, res) =>
  personController.create(req, res)
)
