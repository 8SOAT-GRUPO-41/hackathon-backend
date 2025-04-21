import { UnauthorizedError } from '@/domain/errors';
import { ITokenService } from '@/domain/services/token-service';
import { AuthMiddleware } from '@/infrastructure/middlewares/auth-middleware';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let tokenServiceMock: jest.Mocked<ITokenService>;

  beforeEach(() => {
    tokenServiceMock = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    authMiddleware = new AuthMiddleware(tokenServiceMock);
  });

  it('should throw UnauthorizedError if authorization header is not provided', async () => {
    const httpRequest: HttpRequest = {
      headers: {},
      body: {},
      query: {},
      params: {},
    };

    await expect(authMiddleware.handle(httpRequest)).rejects.toThrow(
      new UnauthorizedError('Token não fornecido'),
    );
  });

  it('should throw UnauthorizedError if authorization header is not in the correct format', async () => {
    const httpRequest: HttpRequest = {
      headers: {
        authorization: 'Invalid-Format',
      },
      body: {},
      query: {},
      params: {},
    };

    await expect(authMiddleware.handle(httpRequest)).rejects.toThrow(
      new UnauthorizedError('Token inválido'),
    );
  });

  it('should throw UnauthorizedError if bearer is not provided', async () => {
    const httpRequest: HttpRequest = {
      headers: {
        authorization: 'InvalidToken',
      },
      body: {},
      query: {},
      params: {},
    };

    await expect(authMiddleware.handle(httpRequest)).rejects.toThrow(
      new UnauthorizedError('Token inválido'),
    );
  });

  it('should throw UnauthorizedError if token verification fails', async () => {
    const httpRequest: HttpRequest = {
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {},
      query: {},
      params: {},
    };

    tokenServiceMock.verifyToken.mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    await expect(authMiddleware.handle(httpRequest)).rejects.toThrow(
      new UnauthorizedError('Token inválido ou expirado'),
    );
    expect(tokenServiceMock.verifyToken).toHaveBeenCalledWith('valid_token');
  });

  it('should return 200 with user data if token is valid', async () => {
    const httpRequest: HttpRequest = {
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {},
      query: {},
      params: {},
    };

    const decodedToken = {
      userId: 'user_id',
      email: 'user@example.com',
    };

    tokenServiceMock.verifyToken.mockReturnValue(decodedToken);

    const httpResponse = await authMiddleware.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      user: {
        id: 'user_id',
        email: 'user@example.com',
      },
    });
    expect(tokenServiceMock.verifyToken).toHaveBeenCalledWith('valid_token');
  });
});
