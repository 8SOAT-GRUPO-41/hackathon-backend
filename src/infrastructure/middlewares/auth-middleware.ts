import { ITokenService } from '@/domain/services/token-service';
import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';

// Definindo um tipo estendido para o objeto de requisição com dados do usuário
type AuthenticatedRequest = HttpRequest & {
  user?: {
    id: string;
    email: string;
  };
};

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const authHeader = httpRequest.headers?.['authorization'] as string | undefined;

      if (!authHeader) {
        return {
          statusCode: 401,
          body: {
            error: 'Unauthorized',
            message: 'Token não fornecido',
          },
        };
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        return {
          statusCode: 401,
          body: {
            error: 'Unauthorized',
            message: 'Token inválido',
          },
        };
      }

      try {
        const decoded = this.tokenService.verifyToken(token);

        // Adiciona o usuário decodificado à resposta para uso no controlador
        return {
          statusCode: 200,
          body: {
            originalRequest: httpRequest.body,
            user: {
              id: decoded.userId,
              email: decoded.email,
            },
          },
        };
      } catch (error) {
        return {
          statusCode: 401,
          body: {
            error: 'Unauthorized',
            message: 'Token inválido ou expirado',
          },
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: {
          error: 'Internal Server Error',
          message: 'Ocorreu um erro ao processar sua solicitação',
        },
      };
    }
  }
}
