import { FastifyHttpServer } from '@/infrastructure/http/fastify/server';
import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import { userRoutes, authRoutes, videoRoutes } from '@/infrastructure/http/routes';
import { makeAuthMiddleware } from '@/infrastructure/factories/auth-factories';
import { adaptFastifyMiddleware } from '@/infrastructure/http/fastify/middleware-adapter';

// Mock dos módulos
jest.mock('fastify', () => {
  const mockFastifyInstance = {
    register: jest.fn().mockReturnThis(),
    addHook: jest.fn().mockReturnThis(),
    decorate: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    listen: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    ready: jest.fn().mockResolvedValue(undefined),
  };
  return jest.fn(() => mockFastifyInstance);
});

jest.mock('@fastify/swagger', () => jest.fn());
jest.mock('@fastify/swagger-ui', () => jest.fn());
jest.mock('@fastify/cors', () => jest.fn());

// Mock das rotas
jest.mock('@/infrastructure/http/routes', () => ({
  userRoutes: [{ method: 'post', url: '/users', handler: jest.fn(), schema: {} }],
  authRoutes: [{ method: 'post', url: '/login', handler: jest.fn(), schema: {} }],
  videoRoutes: [{ method: 'get', url: '/videos', handler: jest.fn(), protected: true, schema: {} }],
}));

// Mock do middleware de autenticação
jest.mock('@/infrastructure/factories/auth-factories', () => ({
  makeAuthMiddleware: jest.fn(),
}));

jest.mock('@/infrastructure/http/fastify/middleware-adapter', () => ({
  adaptFastifyMiddleware: jest.fn(() => 'mocked-middleware'),
}));

describe('FastifyHttpServer', () => {
  let server: FastifyHttpServer;
  let mockFastifyInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    server = new FastifyHttpServer();
    mockFastifyInstance = fastify();
  });

  describe('listen', () => {
    it('should register plugins', async () => {
      await server.listen(3000);

      // Verifica se os plugins foram registrados
      expect(mockFastifyInstance.register).toHaveBeenCalledWith(fastifyCors, expect.any(Object));
      expect(mockFastifyInstance.register).toHaveBeenCalledWith(fastifySwagger, expect.any(Object));
      expect(mockFastifyInstance.register).toHaveBeenCalledWith(
        fastifySwaggerUI,
        expect.any(Object),
      );
    });

    it('should build routes and start listening', async () => {
      await server.listen(3000);

      const mockRoutes = [...userRoutes, ...authRoutes, ...videoRoutes];

      // Verifica se cada rota foi registrada (pelo menos uma vez por rota)
      expect(mockFastifyInstance[mockRoutes[0].method]).toHaveBeenCalled();
      expect(mockFastifyInstance[mockRoutes[1].method]).toHaveBeenCalled();
      expect(mockFastifyInstance[mockRoutes[2].method]).toHaveBeenCalled();

      // Verifica se o middleware foi adaptado para rotas protegidas
      expect(adaptFastifyMiddleware).toHaveBeenCalledWith(makeAuthMiddleware());

      // Verifica se o servidor começou a escutar na porta correta
      expect(mockFastifyInstance.listen).toHaveBeenCalledWith({ port: 3000, host: '0.0.0.0' });
    });
  });

  describe('close', () => {
    it('should close the server', async () => {
      await server.close();
      expect(mockFastifyInstance.close).toHaveBeenCalled();
    });
  });
});
