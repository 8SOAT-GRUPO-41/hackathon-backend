import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthMiddleware } from '@/infrastructure/middlewares/auth-middleware';
import { adaptFastifyErrorHandler } from './error-adapter';

// Estendendo a tipagem do FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
  }
}

export const adaptFastifyMiddleware = (middleware: AuthMiddleware) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const httpRequest = {
        headers: request.headers,
        body: request.body,
        params: request.params,
        query: request.query,
      };

      const {
        body: { user },
      } = await middleware.handle(httpRequest);

      if (user) {
        request.user = user;
      }
    } catch (error) {
      return adaptFastifyErrorHandler(error, request, reply);
    }
  };
};
