import { ErrorCodes } from '@/domain/enums/error-codes';

export class ConflictError extends Error {
  public readonly code: ErrorCodes;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.code = ErrorCodes.CONFLICT_ERROR;
  }
}
