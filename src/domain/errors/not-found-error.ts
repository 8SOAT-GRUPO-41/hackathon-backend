import { ErrorCodes } from '@/domain/enums/error-codes'

export class NotFoundError extends Error {
  public readonly code: ErrorCodes

  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    this.code = ErrorCodes.NOT_FOUND
  }
}
