import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpErrorHandler } from '@/infrastructure/http/error-handler';
import { adaptFastifyErrorHandler } from '@/infrastructure/http/fastify/error-adapter';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { NotFoundError } from '@/domain/errors';

// Mock do HttpErrorHandler
jest.mock('@/infrastructure/http/error-handler', () => {
  return {
    HttpErrorHandler: jest.fn().mockImplementation(() => ({
      handle: jest.fn().mockReturnValue({
        statusCode: 404,
        body: { error: 'Resource not found' },
      }),
    })),
  };
});

describe('Fastify Error Adapter', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockError: Error;

  beforeEach(() => {
    mockRequest = {
      log: {
        error: jest.fn(),
      } as any,
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockError = new NotFoundError('Resource not found');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log the error', () => {
    // Act
    adaptFastifyErrorHandler(mockError, mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockRequest.log?.error).toHaveBeenCalledWith(mockError);
  });

  it('should create a new HttpErrorHandler', () => {
    // Act
    adaptFastifyErrorHandler(mockError, mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(HttpErrorHandler).toHaveBeenCalledTimes(1);
  });

  it('should handle the error with HttpErrorHandler', () => {
    // Act
    adaptFastifyErrorHandler(mockError, mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    const handler = (HttpErrorHandler as jest.Mock).mock.results[0].value;
    expect(handler.handle).toHaveBeenCalledWith(mockError);
  });

  it('should return reply with status and body from HttpErrorHandler', () => {
    // Act
    adaptFastifyErrorHandler(mockError, mockRequest as FastifyRequest, mockReply as FastifyReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Resource not found' });
  });
});
