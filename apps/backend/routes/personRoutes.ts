import { PersonController } from '@/controllers/personController.js'
import { validateBody } from '@/middlewares/validate.js'
import { PersonRepository } from '@/repositories/personRepository.js'
import { PersonService } from '@/services/personService.js'
import { createPersonSchema } from '@/validations/personValidation.js'
import { Router } from 'express'

// 依存性注入でインスタンス作成
const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)
const personController = new PersonController(personService)

export const personRoutes = Router()

personRoutes.post('/people', validateBody(createPersonSchema), (req, res) =>
  personController.create(req, res)
)
