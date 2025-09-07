import { Router } from 'express'
import { validateBody } from '@/middlewares/validate'
import { createPersonSchema } from '@/validations/personValidation'
import { createPerson } from '@/controllers/personController'

const router = Router()

router.post('/people', validateBody(createPersonSchema), createPerson)

export { router as personRoutes }