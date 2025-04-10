import { ErrorCodes } from '@/domain/enums/error-codes'

export class InvalidPasswordError extends Error {
  public readonly code: ErrorCodes

  constructor(message: string) {
    super(message)
    this.name = 'InvalidPasswordError'
    this.code = ErrorCodes.INVALID_PASSWORD
  }
}
