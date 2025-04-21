import { RefreshToken } from '@/application/usecases/auth/refresh-token';
import { RefreshTokenController } from '@/infrastructure/controllers/auth/refresh-token-controller';
import { HttpRequest } from '@/infrastructure/http/interfaces';

type RefreshTokenRequestBody = {
  refreshToken: string;
};

describe('RefreshTokenController', () => {
  let refreshTokenController: RefreshTokenController;
  let refreshTokenMock: jest.Mocked<RefreshToken>;

  beforeEach(() => {
    refreshTokenMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RefreshToken>;

    refreshTokenController = new RefreshTokenController(refreshTokenMock);
  });

  it('should return 400 if refresh token is not provided', async () => {
    const httpRequest: HttpRequest<RefreshTokenRequestBody> = {
      body: {} as RefreshTokenRequestBody,
      query: {},
      params: {},
      headers: {},
    };

    const httpResponse = await refreshTokenController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual({
      error: 'Bad Request',
      message: 'Refresh token é obrigatório',
    });
  });

  it('should call RefreshToken with correct value', async () => {
    const httpRequest: HttpRequest<RefreshTokenRequestBody> = {
      body: {
        refreshToken: 'any-refresh-token',
      },
      query: {},
      params: {},
      headers: {},
    };

    await refreshTokenController.handle(httpRequest);

    expect(refreshTokenMock.execute).toHaveBeenCalledWith({
      refreshToken: 'any-refresh-token',
    });
  });

  it('should return 200 if valid refresh token is provided', async () => {
    const httpRequest: HttpRequest<RefreshTokenRequestBody> = {
      body: {
        refreshToken: 'any-refresh-token',
      },
      query: {},
      params: {},
      headers: {},
    };

    const refreshResult = {
      token: 'new-token',
      refreshToken: 'new-refresh-token',
    };

    refreshTokenMock.execute.mockResolvedValue(refreshResult);

    const httpResponse = await refreshTokenController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual(refreshResult);
  });

  it('should return 401 if RefreshToken throws any error', async () => {
    const httpRequest: HttpRequest<RefreshTokenRequestBody> = {
      body: {
        refreshToken: 'invalid-refresh-token',
      },
      query: {},
      params: {},
      headers: {},
    };

    refreshTokenMock.execute.mockRejectedValue(new Error('Invalid refresh token'));

    const httpResponse = await refreshTokenController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual({
      error: 'Unauthorized',
      message: 'Refresh token inválido ou expirado',
    });
  });
});
