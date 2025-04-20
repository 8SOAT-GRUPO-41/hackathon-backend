import { UnauthorizedError } from '@/domain/errors';
import { ITokenService } from '@/domain/services/token-service';
import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';

type AuthMiddlewareHttpResponse = HttpResponse<{
  user: {
    id: string;
    email: string;
  };
}>;

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  async handle(httpRequest: HttpRequest): Promise<AuthMiddlewareHttpResponse> {
    const authHeader = httpRequest.headers?.['authorization'] as string | undefined;

    if (!authHeader) {
      throw new UnauthorizedError('Token não fornecido');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Token inválido');
    }

    try {
      const decoded = this.tokenService.verifyToken(token);

      return {
        statusCode: 200,
        body: {
          user: {
            id: decoded.userId,
            email: decoded.email,
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedError('Token inválido ou expirado');
    }
  }
}
