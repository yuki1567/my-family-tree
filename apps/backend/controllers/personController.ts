import { PersonService } from '@/services/personService'
import { CreatePersonRequest } from '@/validations/personValidation'
import { Request, Response } from 'express'

export class PersonController {
  constructor(private personService: PersonService) {}

  async create(req: Request, res: Response): Promise<void> {
    const validatedData = req.body as CreatePersonRequest
    const result = await this.personService.create(validatedData)

    res.status(201).json({
      isSuccess: true,
      data: result,
    })
  }
}
