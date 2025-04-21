import { Controller } from '@/infrastructure/controllers/interfaces';
import { adaptFastifyRoute } from '@/infrastructure/http/fastify/adapter';
import { adaptFastifyErrorHandler } from '@/infrastructure/http/fastify/error-adapter';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Mock do error adapter
jest.mock('@/infrastructure/http/fastify/error-adapter', () => ({
  adaptFastifyErrorHandler: jest.fn().mockImplementation(() => mockErrorAdapterResponse),
}));

// Mock de respostas
const mockErrorAdapterResponse = { status: jest.fn().mockReturnThis(), send: jest.fn() };

describe('Fastify Adapter', () => {
  // Usando any type para simplificar o teste
  const mockRequest: any = {
    body: { test: 'body' },
    params: { test: 'params' },
    query: { test: 'query' },
    user: { id: 'user-id', email: 'user@example.com' },
  };

  const mockReply: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  // Mock do contexto do Fastify
  const mockFastifyContext: Partial<FastifyInstance> = {
    // Adicionando propriedades mínimas necessárias
    server: {} as any,
    pluginName: 'test',
    prefix: '',
    version: '',
    // ... outras propriedades podem ser adicionadas conforme necessário
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call controller with correct parameters', async () => {
    // Arrange
    const mockController: Controller = {
      handle: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: { data: 'success' },
      }),
    };

    // Usando any para ignorar erros de tipagem com this context
    const handlerFunction: any = adaptFastifyRoute(mockController);

    // Act
    await handlerFunction(mockRequest, mockReply);

    // Assert
    expect(mockController.handle).toHaveBeenCalledWith({
      body: mockRequest.body,
      params: mockRequest.params,
      query: mockRequest.query,
      userId: mockRequest.user.id,
    });
  });

  it('should return response with correct status and body', async () => {
    // Arrange
    const mockResponse = {
      statusCode: 201,
      body: { data: 'created' },
    };

    const mockController: Controller = {
      handle: jest.fn().mockResolvedValue(mockResponse),
    };

    // Usando any para ignorar erros de tipagem com this context
    const handlerFunction: any = adaptFastifyRoute(mockController);

    // Act
    await handlerFunction(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({ data: 'created' });
  });

  it('should handle errors with error adapter', async () => {
    // Arrange
    const mockError = new Error('Test error');
    const mockController: Controller = {
      handle: jest.fn().mockRejectedValue(mockError),
    };

    // Usando any para ignorar erros de tipagem com this context
    const handlerFunction: any = adaptFastifyRoute(mockController);

    // Act
    await handlerFunction(mockRequest, mockReply);

    // Assert
    expect(adaptFastifyErrorHandler).toHaveBeenCalledWith(mockError, mockRequest, mockReply);
  });
});
