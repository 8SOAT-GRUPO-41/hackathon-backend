import { makeSignInController } from '@/infrastructure/factories/user-controller-factory'
import { errorResponseSchema } from '@/infrastructure/swagger/error-response-schema'
import { ErrorCodes } from '@/domain/enums/error-codes'
import type { HttpRoute } from '@/infrastructure/http/interfaces'

export const authRoutes = [
  {
    method: 'post',
    url: '/sign-in',
    handler: makeSignInController,
    schema: {
      tags: ['Auth'],
      summary: 'Create a new user',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
        required: ['email', 'password'],
      },
      response: {
        201: {
          type: 'string',
        },
        400: errorResponseSchema(400, ErrorCodes.BAD_REQUEST),
        409: errorResponseSchema(409, ErrorCodes.CONFLICT_ERROR),
        422: errorResponseSchema(422, ErrorCodes.UNPROCESSABLE_ENTITY),
        500: errorResponseSchema(500, ErrorCodes.INTERNAL_SERVER_ERROR),
      },
    },
  },
] as HttpRoute[]
