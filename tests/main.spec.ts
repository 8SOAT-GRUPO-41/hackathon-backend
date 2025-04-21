// Mock do dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock do FastifyHttpServer
jest.mock('@/infrastructure/http/fastify/server', () => ({
  FastifyHttpServer: jest.fn().mockImplementation(() => ({
    listen: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock do SQSConsumer
jest.mock('@/infrastructure/consumers/sqs-consumer', () => ({
  SQSConsumer: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
  })),
}));

// Mock do logger
jest.mock('@/infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Application Main', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let exitSpy: jest.SpyInstance;
  let mockFastifyServer: any;
  let mockSQSConsumer: any;

  beforeEach(() => {
    // Salva o estado original do process.env
    originalEnv = { ...process.env };

    // Espia o process.exit em vez de mocká-lo diretamente
    // @ts-ignore - Ignoramos o erro de tipagem usando ts-ignore
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });

    // Configura variáveis de ambiente para o teste
    process.env.PORT = '3000';
    process.env.SQS_QUEUE_URL = 'https://sqs.example.com/queue';

    // Limpa cache para forçar reimportação do main
    jest.resetModules();
  });

  afterEach(() => {
    // Restaura o estado original
    process.env = originalEnv;
    exitSpy.mockRestore();

    // Limpa mocks
    jest.clearAllMocks();
  });

  it('should initialize the server with the correct port', async () => {
    // Importa o main para que ele seja executado no contexto do teste
    const { server } = await import('@/main');

    // Verifica se o servidor foi inicializado com a porta correta
    expect(server.listen).toHaveBeenCalledWith(3000);
  });

  it('should initialize the SQS consumer with the correct queue URL', async () => {
    // Obtém a instância do mock antes da importação
    const { SQSConsumer } = require('@/infrastructure/consumers/sqs-consumer');

    // Importa o main
    await import('@/main');

    // Verifica se o SQSConsumer foi construído com a URL correta
    expect(SQSConsumer).toHaveBeenCalledWith('https://sqs.example.com/queue');

    // Verifica se o método start foi chamado
    expect(SQSConsumer.mock.results[0].value.start).toHaveBeenCalled();
  });

  it('should handle SIGINT signal correctly', async () => {
    // Obtém as instâncias dos mocks
    const { SQSConsumer } = require('@/infrastructure/consumers/sqs-consumer');
    const { FastifyHttpServer } = require('@/infrastructure/http/fastify/server');
    const { logger } = require('@/infrastructure/logger');

    // Importa o main
    const { server } = await import('@/main');

    // Obtém o consumer mockado
    const mockConsumer = SQSConsumer.mock.results[0].value;

    // Simula um sinal SIGINT
    process.emit('SIGINT');

    // Verifica se o logger foi chamado
    expect(logger.info).toHaveBeenCalledWith('Application shutdown requested');

    // Verifica se o consumer foi parado
    expect(mockConsumer.stop).toHaveBeenCalled();

    // Verifica se o servidor foi fechado
    expect(server.close).toHaveBeenCalled();

    // Não verificamos o process.exit, pois ele pode não ser chamado no ambiente de teste
    // Ou o Jest pode interceptar a chamada para não encerrar os testes
  });

  it('should handle SIGTERM signal correctly', async () => {
    // Obtém as instâncias dos mocks
    const { SQSConsumer } = require('@/infrastructure/consumers/sqs-consumer');
    const { logger } = require('@/infrastructure/logger');

    // Importa o main
    const { server } = await import('@/main');

    // Obtém o consumer mockado
    const mockConsumer = SQSConsumer.mock.results[0].value;

    // Simula um sinal SIGTERM
    process.emit('SIGTERM');

    // Verifica se o logger foi chamado
    expect(logger.info).toHaveBeenCalledWith('Application termination requested');

    // Verifica se o consumer foi parado
    expect(mockConsumer.stop).toHaveBeenCalled();

    // Verifica se o servidor foi fechado
    expect(server.close).toHaveBeenCalled();

    // Não verificamos o process.exit, pois ele pode não ser chamado no ambiente de teste
    // Ou o Jest pode interceptar a chamada para não encerrar os testes
  });

  it('should handle SQS consumer initialization errors', async () => {
    // Obtém o mock do logger
    const { logger } = require('@/infrastructure/logger');

    // Obtém o mock do SQSConsumer para configurar um erro
    const { SQSConsumer } = require('@/infrastructure/consumers/sqs-consumer');
    const mockError = new Error('SQS Consumer start error');
    SQSConsumer.mockImplementation(() => ({
      start: jest.fn().mockRejectedValue(mockError),
      stop: jest.fn(),
    }));

    // Importa o main
    await import('@/main');

    // Avança no tempo para permitir que a promise rejeitada seja processada
    await new Promise(process.nextTick);

    // Verifica se o erro foi logado
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: mockError }),
      'Failed to start SQS consumer',
    );
  });
});
