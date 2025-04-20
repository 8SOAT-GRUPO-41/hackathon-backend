import { makeSignInController } from '@/infrastructure/factories/user-controller-factory';
import {
  makeAuthenticateController,
  makeRefreshTokenController,
  makeSignUpController,
} from '@/infrastructure/factories/auth-factories';
import { errorResponseSchema } from '@/infrastructure/swagger/error-response-schema';
import { ErrorCodes } from '@/domain/enums/error-codes';
import type { HttpRoute } from '@/infrastructure/http/interfaces';

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
  {
    method: 'post',
    url: '/login',
    handler: makeAuthenticateController,
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
        required: ['email', 'password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            userId: { type: 'string' },
          },
        },
        400: errorResponseSchema(400, ErrorCodes.BAD_REQUEST),
        401: errorResponseSchema(401, ErrorCodes.INVALID_PASSWORD),
        404: errorResponseSchema(404, ErrorCodes.NOT_FOUND),
        500: errorResponseSchema(500, ErrorCodes.INTERNAL_SERVER_ERROR),
      },
    },
  },
  {
    method: 'post',
    url: '/refresh-token',
    handler: makeRefreshTokenController,
    schema: {
      tags: ['Auth'],
      summary: 'Refresh access token using a valid refresh token',
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        400: errorResponseSchema(400, ErrorCodes.BAD_REQUEST),
        401: errorResponseSchema(401, ErrorCodes.INVALID_PASSWORD),
        500: errorResponseSchema(500, ErrorCodes.INTERNAL_SERVER_ERROR),
      },
    },
  },
  {
    method: 'post',
    url: '/sign-up',
    handler: makeSignUpController,
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
    },
  },
] as HttpRoute[];
