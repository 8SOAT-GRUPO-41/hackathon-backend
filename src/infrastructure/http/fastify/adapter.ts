import type { RouteHandlerMethod } from 'fastify';
import type { Controller } from '@/infrastructure/controllers/interfaces';
import { adaptFastifyErrorHandler } from './error-adapter';

export const adaptFastifyRoute = (controller: Controller): RouteHandlerMethod => {
  return async (request, reply) => {
    try {
      const httpResponse = await controller.handle({
        body: request.body,
        params: request.params,
        query: request.query,
        userId: request.user?.id,
      });
      return reply.status(httpResponse.statusCode).send(httpResponse.body);
    } catch (error) {
      return adaptFastifyErrorHandler(error, request, reply);
    }
  };
};
