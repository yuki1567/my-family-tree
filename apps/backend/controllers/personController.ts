import { Request, Response } from 'express'
import { CreatePersonRequest } from '@/validations/personValidation'
import { personService } from '@/services/personService'

export async function createPerson(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = req.body as CreatePersonRequest
    const result = await personService.create(validatedData)
    
    res.status(201).json({
      isSuccess: true,
      data: result
    })
  } catch (error) {
    console.error('Error in createPerson controller:', error)
    res.status(500).json({
      isSuccess: false,
      error: {
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        details: []
      }
    })
  }
}