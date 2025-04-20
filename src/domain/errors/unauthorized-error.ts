import { ErrorCodes } from '@/domain/enums/error-codes';

export class UnauthorizedError extends Error {
  public readonly code: ErrorCodes;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.code = ErrorCodes.UNAUTHORIZED;
  }
}
