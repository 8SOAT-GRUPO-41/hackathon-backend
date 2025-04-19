import { Authenticate } from "@/application/usecases/auth/authenticate";
import { InvalidPasswordError, NotFoundError } from "@/domain/errors";
import { HttpRequest, HttpResponse } from "@/infrastructure/http/interfaces";

type AuthRequestBody = {
  email: string;
  password: string;
};

export class AuthenticateController {
  constructor(private readonly authenticate: Authenticate) {}

  async handle(
    httpRequest: HttpRequest<AuthRequestBody>
  ): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body || ({} as AuthRequestBody);

      if (!email || !password) {
        return {
          statusCode: 400,
          body: {
            error: "Bad Request",
            message: "Email e senha são obrigatórios",
          },
        };
      }

      const result = await this.authenticate.execute({ email, password });

      return {
        statusCode: 200,
        body: result,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return {
          statusCode: 404,
          body: {
            error: "Not Found",
            message: error.message,
          },
        };
      }

      if (error instanceof InvalidPasswordError) {
        return {
          statusCode: 401,
          body: {
            error: "Unauthorized",
            message: error.message,
          },
        };
      }

      return {
        statusCode: 500,
        body: {
          error: "Internal Server Error",
          message: "Ocorreu um erro ao processar sua solicitação",
        },
      };
    }
  }
}
