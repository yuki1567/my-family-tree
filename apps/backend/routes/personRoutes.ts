import { Router } from 'express'
import { validateBody } from '@/middlewares/validate'
import { createPersonSchema } from '@/validations/personValidation'
import { PersonController } from '@/controllers/personController'
import { PersonService } from '@/services/personService'
import { PersonRepository } from '@/repositories/personRepository'

// 依存性注入でインスタンス作成
const personRepository = new PersonRepository()
const personService = new PersonService(personRepository)
const personController = new PersonController(personService)

export const personRoutes = Router()

personRoutes.post('/people', validateBody(createPersonSchema), (req, res) => 
  personController.create(req, res)
)