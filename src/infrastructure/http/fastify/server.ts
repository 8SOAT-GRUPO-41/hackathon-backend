import { makeAuthMiddleware } from '@/infrastructure/factories/auth-factories';
import type { HttpServer } from '@/infrastructure/http/interfaces';
import { authRoutes, userRoutes, videoRoutes } from '@/infrastructure/http/routes';
import swaggerConfig from '@/infrastructure/swagger/swagger-config';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastify, { RouteOptions, type FastifyInstance } from 'fastify';
import { adaptFastifyRoute } from './adapter';
import { adaptFastifyMiddleware } from './middleware-adapter';

export class FastifyHttpServer implements HttpServer {
  private server: FastifyInstance;

  constructor() {
    this.server = fastify({
      logger:
        process.env.NODE_ENV === 'development'
          ? {
              transport: {
                target: 'pino-pretty',
              },
              level: 'debug',
            }
          : true,
    });
  }

  private async buildRoutes(): Promise<void> {
    const routes = [...userRoutes, ...authRoutes, ...videoRoutes];
    const apiPrefix = '/api/v1';

    // Middleware de autenticação para rotas protegidas
    const authMiddleware = adaptFastifyMiddleware(makeAuthMiddleware());

    for (const route of routes) {
      const routeOptions: Partial<RouteOptions> = {
        schema: route.schema,
      };

      // Se a rota for protegida, adiciona o middleware de autenticação
      if (route.protected) {
        routeOptions.preHandler = authMiddleware;
      }

      this.server[route.method](
        `${apiPrefix}${route.url}`,
        routeOptions,
        adaptFastifyRoute(route.handler()),
      );
    }
  }

  private async buildDocs(): Promise<void> {
    await this.server
      .register(fastifySwagger, {
        openapi: swaggerConfig,
      })
      .register(fastifySwaggerUI, {
        routePrefix: '/docs',
      });
  }

  private async registerPlugins(): Promise<void> {
    await this.server.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      credentials: true,
    });
  }

  async listen(port: number): Promise<void> {
    await this.registerPlugins();
    await this.buildDocs();
    await this.buildRoutes();
    await this.server.ready();
    this.server.listen({ port, host: '0.0.0.0' });
  }

  async close(): Promise<void> {
    await this.server.close();
  }
}
