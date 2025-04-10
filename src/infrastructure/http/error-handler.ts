import { HttpStatusCode } from '@/infrastructure/http/helper'
import {
  NotFoundError,
  ConflictError,
  InvalidPasswordError,
} from '@/domain/errors'
import { ErrorCodes } from '@/domain/enums/error-codes'
import type { HttpResponse } from '@/infrastructure/http/interfaces'

export class HttpErrorHandler {
  handle(error: unknown): HttpResponse {
    if (error instanceof NotFoundError) {
      return this.createErrorResponse(
        error.code,
        error.message,
        HttpStatusCode.NOT_FOUND
      )
    }

    if (
      typeof error === 'object' &&
      (error as { code?: string }).code === 'FST_ERR_VALIDATION'
    ) {
      return this.createErrorResponse(
        ErrorCodes.BAD_REQUEST,
        (error as { message?: string }).message || 'Validation error',
        HttpStatusCode.BAD_REQUEST
      )
    }

    if (error instanceof ConflictError) {
      return this.createErrorResponse(
        error.code,
        error.message,
        HttpStatusCode.CONFLICT
      )
    }

    if (error instanceof InvalidPasswordError) {
      return this.createErrorResponse(
        error.code,
        error.message,
        HttpStatusCode.UNPROCESSABLE_ENTITY
      )
    }

    return this.createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      (error as Error).message || 'Something unexpected happened',
      HttpStatusCode.SERVER_ERROR
    )
  }

  private createErrorResponse(
    code: ErrorCodes,
    message: string,
    status: number
  ): HttpResponse {
    return {
      statusCode: status,
      body: {
        status: 'error',
        statusCode: status,
        code,
        message,
      },
    }
  }
}
