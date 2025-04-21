import { Authenticate } from '@/application/usecases/auth/authenticate';
import { InvalidPasswordError, NotFoundError } from '@/domain/errors';
import { AuthenticateController } from '@/infrastructure/controllers/auth/authenticate-controller';
import { HttpRequest } from '@/infrastructure/http/interfaces';

type AuthRequestBody = {
  email: string;
  password: string;
};

describe('AuthenticateController', () => {
  let authenticateController: AuthenticateController;
  let authenticateMock: jest.Mocked<Authenticate>;

  beforeEach(() => {
    authenticateMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<Authenticate>;

    authenticateController = new AuthenticateController(authenticateMock);
  });

  it('should return 400 if email is not provided', async () => {
    const httpRequest: HttpRequest<Partial<AuthRequestBody>> = {
      body: { password: 'any_password' },
      query: {},
      params: {},
      headers: {},
    };

    const httpResponse = await authenticateController.handle(
      httpRequest as HttpRequest<AuthRequestBody>,
    );

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual({
      error: 'Bad Request',
      message: 'Email e senha são obrigatórios',
    });
  });

  it('should return 400 if password is not provided', async () => {
    const httpRequest: HttpRequest<Partial<AuthRequestBody>> = {
      body: { email: 'any_email@mail.com' },
      query: {},
      params: {},
      headers: {},
    };

    const httpResponse = await authenticateController.handle(
      httpRequest as HttpRequest<AuthRequestBody>,
    );

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual({
      error: 'Bad Request',
      message: 'Email e senha são obrigatórios',
    });
  });

  it('should call Authenticate with correct values', async () => {
    const httpRequest: HttpRequest<AuthRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    await authenticateController.handle(httpRequest);

    expect(authenticateMock.execute).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password',
    });
  });

  it('should return 200 if valid credentials are provided', async () => {
    const httpRequest: HttpRequest<AuthRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    const authResult = {
      token: 'any_token',
      refreshToken: 'any_refresh_token',
      userId: 'any_id',
    };

    authenticateMock.execute.mockResolvedValue(authResult);

    const httpResponse = await authenticateController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual(authResult);
  });

  it('should return 404 if user is not found', async () => {
    const httpRequest: HttpRequest<AuthRequestBody> = {
      body: {
        email: 'nonexistent@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    authenticateMock.execute.mockRejectedValue(new NotFoundError('Usuário não encontrado'));

    const httpResponse = await authenticateController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body).toEqual({
      error: 'Not Found',
      message: 'Usuário não encontrado',
    });
  });

  it('should return 401 if password is invalid', async () => {
    const httpRequest: HttpRequest<AuthRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'wrong_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    authenticateMock.execute.mockRejectedValue(new InvalidPasswordError('Senha inválida'));

    const httpResponse = await authenticateController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual({
      error: 'Unauthorized',
      message: 'Senha inválida',
    });
  });

  it('should return 500 if authenticate throws any other error', async () => {
    const httpRequest: HttpRequest<AuthRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    authenticateMock.execute.mockRejectedValue(new Error('Any error'));

    const httpResponse = await authenticateController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual({
      error: 'Internal Server Error',
      message: 'Ocorreu um erro ao processar sua solicitação',
    });
  });
});
