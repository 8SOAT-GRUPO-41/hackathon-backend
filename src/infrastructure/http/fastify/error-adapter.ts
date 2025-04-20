import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpErrorHandler } from '../error-handler';

export const adaptFastifyErrorHandler = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
): FastifyReply => {
  request.log.error(error);

  const decoupledHandler = new HttpErrorHandler();
  const httpResponse = decoupledHandler.handle(error);
  return reply.status(httpResponse.statusCode).send(httpResponse.body);
};
