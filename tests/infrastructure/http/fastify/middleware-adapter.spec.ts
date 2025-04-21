import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthMiddleware } from '@/infrastructure/middlewares/auth-middleware';
import { adaptFastifyMiddleware } from '@/infrastructure/http/fastify/middleware-adapter';
import { adaptFastifyErrorHandler } from '@/infrastructure/http/fastify/error-adapter';
import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';
import { ITokenService } from '@/domain/services/token-service';

// Mock do error adapter
jest.mock('@/infrastructure/http/fastify/error-adapter', () => ({
  adaptFastifyErrorHandler: jest.fn(),
}));

describe('Fastify Middleware Adapter', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockAuthMiddleware: AuthMiddleware;

  beforeEach(() => {
    mockRequest = {
      headers: { authorization: 'Bearer token123' },
      body: { test: 'body' },
      params: { test: 'params' },
      query: { test: 'query' },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock do tokenService
    const mockTokenService: ITokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    mockAuthMiddleware = {
      tokenService: mockTokenService,
      handle: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: {
          user: {
            id: 'user-id',
            email: 'user@example.com',
          },
        },
      }),
    } as unknown as AuthMiddleware;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call AuthMiddleware with correct request data', async () => {
    // Arrange
    const middleware = adaptFastifyMiddleware(mockAuthMiddleware);

    // Act
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockAuthMiddleware.handle).toHaveBeenCalledWith({
      headers: mockRequest.headers,
      body: mockRequest.body,
      params: mockRequest.params,
      query: mockRequest.query,
    });
  });

  it('should set user data on request when authentication succeeds', async () => {
    // Arrange
    const middleware = adaptFastifyMiddleware(mockAuthMiddleware);

    // Act
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockRequest.user).toEqual({
      id: 'user-id',
      email: 'user@example.com',
    });
  });

  it('should not set user data if middleware response does not contain user', async () => {
    // Arrange
    mockAuthMiddleware.handle = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: {}, // No user data
    });

    const middleware = adaptFastifyMiddleware(mockAuthMiddleware);

    // Act
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockRequest.user).toBeUndefined();
  });

  it('should handle errors with error adapter', async () => {
    // Arrange
    const mockError = new Error('Authorization failed');
    mockAuthMiddleware.handle = jest.fn().mockRejectedValue(mockError);

    const middleware = adaptFastifyMiddleware(mockAuthMiddleware);

    // Act
    await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(adaptFastifyErrorHandler).toHaveBeenCalledWith(mockError, mockRequest, mockReply);
  });
});
