import { SQSConsumer } from '@/infrastructure/consumers/sqs-consumer';
import { SQSConsumerService } from '@/infrastructure/services/sqs-consumer-service';
import { TrackProcessingJobController } from '@/infrastructure/controllers/job/track-processing-job-controller';

// Mock do makeTrackProcessingJobController factory
jest.mock('@/infrastructure/factories/controller/track-processing-job-controller-factory', () => ({
  makeTrackProcessingJobController: jest.fn(() => mockController),
}));

// Mock do SQSConsumerService
jest.mock('@/infrastructure/services/sqs-consumer-service');

// Mock do logger
jest.mock('@/infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do controller
const mockController = {
  handle: jest.fn(),
};

describe('SQSConsumer', () => {
  let sqsConsumer: SQSConsumer;
  const mockQueueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue';
  let mockSQSService: jest.Mocked<SQSConsumerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configura o mockSQSService
    mockSQSService = {
      receiveMessages: jest.fn(),
      deleteMessage: jest.fn(),
    } as unknown as jest.Mocked<SQSConsumerService>;

    // Substitui o construtor do SQSConsumerService para retornar nosso mock
    (SQSConsumerService as jest.Mock).mockImplementation(() => mockSQSService);

    sqsConsumer = new SQSConsumer(mockQueueUrl, 1); // reduzido para 1ms para testes
  });

  describe('start', () => {
    // Aumentando o timeout para evitar falha por timeout
    it('should not start if already running', async () => {
      // Mockando para retornar lista vazia e evitar loop infinito
      mockSQSService.receiveMessages.mockResolvedValue([]);

      // Inicia primeira vez sem await (pois é um loop infinito)
      const startPromise = sqsConsumer.start();

      // Aguarda um pouco para garantir que iniciou
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Tenta iniciar novamente antes de parar
      await sqsConsumer.start();

      // Para o consumer
      sqsConsumer.stop();

      // Espera a promessa resolver
      await new Promise((resolve) => setTimeout(resolve, 50));

      // O logger.warn deveria ser chamado indicando que já está rodando
      expect(require('@/infrastructure/logger').logger.warn).toHaveBeenCalledWith(
        'SQS consumer is already running',
      );
    }, 10000); // Aumentando para 10 segundos

    it('should process messages when they are received', async () => {
      const mockMessages = [
        {
          MessageId: 'msg1',
          Body: JSON.stringify({ videoId: 'video1', status: 'COMPLETED' }),
          ReceiptHandle: 'receipt1',
        },
      ];

      mockSQSService.receiveMessages.mockResolvedValueOnce(mockMessages);
      mockSQSService.receiveMessages.mockResolvedValue([]);

      mockController.handle.mockResolvedValueOnce({ success: true });

      // Inicia o consumer
      const startPromise = sqsConsumer.start();

      // Espera pelo processamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockController.handle).toHaveBeenCalledWith({
        messageId: 'msg1',
        body: { videoId: 'video1', status: 'COMPLETED' },
      });

      expect(mockSQSService.deleteMessage).toHaveBeenCalledWith('receipt1');
    });

    it('should not delete message if processing fails', async () => {
      const mockMessages = [
        {
          MessageId: 'msg1',
          Body: JSON.stringify({ videoId: 'video1', status: 'COMPLETED' }),
          ReceiptHandle: 'receipt1',
        },
      ];

      mockSQSService.receiveMessages.mockResolvedValueOnce(mockMessages);
      mockSQSService.receiveMessages.mockResolvedValue([]);

      mockController.handle.mockResolvedValueOnce({ success: false });

      const startPromise = sqsConsumer.start();

      // Espera pelo processamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockController.handle).toHaveBeenCalledWith({
        messageId: 'msg1',
        body: { videoId: 'video1', status: 'COMPLETED' },
      });

      expect(mockSQSService.deleteMessage).not.toHaveBeenCalled();
    });

    it('should handle errors in message processing', async () => {
      const mockMessages = [
        {
          MessageId: 'msg1',
          Body: JSON.stringify({ videoId: 'video1', status: 'COMPLETED' }),
          ReceiptHandle: 'receipt1',
        },
      ];

      mockSQSService.receiveMessages.mockResolvedValueOnce(mockMessages);
      mockSQSService.receiveMessages.mockResolvedValue([]);

      mockController.handle.mockRejectedValueOnce(new Error('Processing error'));

      const startPromise = sqsConsumer.start();

      // Espera pelo processamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockController.handle).toHaveBeenCalled();
      expect(require('@/infrastructure/logger').logger.error).toHaveBeenCalled();
      expect(mockSQSService.deleteMessage).not.toHaveBeenCalled();
    });

    it('should handle invalid message body', async () => {
      const mockMessages = [
        {
          MessageId: 'msg1',
          Body: '', // String vazia em vez de null
          ReceiptHandle: 'receipt1',
        },
      ];

      mockSQSService.receiveMessages.mockResolvedValueOnce(mockMessages);
      mockSQSService.receiveMessages.mockResolvedValue([]);

      const startPromise = sqsConsumer.start();

      // Espera pelo processamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(require('@/infrastructure/logger').logger.warn).toHaveBeenCalled();
      expect(mockController.handle).not.toHaveBeenCalled();
    });

    it('should handle error in polling cycle', async () => {
      // Primeiro, rejeitamos com erro
      mockSQSService.receiveMessages.mockRejectedValueOnce(new Error('Polling error'));
      // Depois, resolvemos com lista vazia para não entrar em loop infinito
      mockSQSService.receiveMessages.mockResolvedValue([]);

      const startPromise = sqsConsumer.start();

      // Espera pelo processamento do erro
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(require('@/infrastructure/logger').logger.error).toHaveBeenCalled();
    }, 10000); // Aumentando para 10 segundos
  });

  describe('stop', () => {
    it('should log warning if not running', () => {
      sqsConsumer.stop();

      expect(require('@/infrastructure/logger').logger.warn).toHaveBeenCalledWith(
        'SQS consumer is not running',
      );
    });

    it('should stop running consumer', async () => {
      mockSQSService.receiveMessages.mockResolvedValue([]);

      // Inicia o consumer
      sqsConsumer.start();

      // Espera um pouco
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Para o consumer
      sqsConsumer.stop();

      // Aguarda finalização
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(require('@/infrastructure/logger').logger.info).toHaveBeenCalledWith(
        'Stopping SQS consumer',
      );
    });
  });
});
