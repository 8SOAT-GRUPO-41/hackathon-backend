import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthMiddleware } from '@/infrastructure/middlewares/auth-middleware';

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
    const httpRequest = {
      headers: request.headers,
      body: request.body,
      params: request.params,
      query: request.query,
    };

    const httpResponse = await middleware.handle(httpRequest);

    if (httpResponse.statusCode === 200) {
      // Se a autenticação foi bem-sucedida, adiciona os dados do usuário ao request
      // para uso posterior pelos handlers
      const { user } = httpResponse.body as any;
      if (user) {
        request.user = user;
      }
      return;
    }

    // Se a autenticação falhou, retorna o erro
    return reply.code(httpResponse.statusCode).send(httpResponse.body);
  };
};
