import { RefreshToken } from "@/application/usecases/auth/refresh-token";
import { HttpRequest, HttpResponse } from "@/infrastructure/http/interfaces";

type RefreshTokenRequestBody = {
  refreshToken: string;
};

export class RefreshTokenController {
  constructor(private readonly refreshToken: RefreshToken) {}

  async handle(
    httpRequest: HttpRequest<RefreshTokenRequestBody>
  ): Promise<HttpResponse> {
    try {
      const { refreshToken } =
        httpRequest.body || ({} as RefreshTokenRequestBody);

      if (!refreshToken) {
        return {
          statusCode: 400,
          body: {
            error: "Bad Request",
            message: "Refresh token é obrigatório",
          },
        };
      }

      const result = await this.refreshToken.execute({ refreshToken });

      return {
        statusCode: 200,
        body: result,
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: {
          error: "Unauthorized",
          message: "Refresh token inválido ou expirado",
        },
      };
    }
  }
}
