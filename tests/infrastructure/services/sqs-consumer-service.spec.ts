import { SQSConsumerService } from '@/infrastructure/services/sqs-consumer-service';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

// Funcionamento correto do mock
const mockSend = jest.fn();

// Mock do AWS SDK
jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    ReceiveMessageCommand: jest.fn(),
    DeleteMessageCommand: jest.fn(),
  };
});

// Mock do logger
jest.mock('@/infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('SQSConsumerService', () => {
  let sqsConsumerService: SQSConsumerService;
  const mockQueueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue';

  beforeEach(() => {
    jest.clearAllMocks();
    sqsConsumerService = new SQSConsumerService(mockQueueUrl);
  });

  describe('receiveMessages', () => {
    it('should receive messages successfully', async () => {
      const mockMessages = [
        { MessageId: 'msg1', Body: 'message 1', ReceiptHandle: 'receipt1' },
        { MessageId: 'msg2', Body: 'message 2', ReceiptHandle: 'receipt2' },
      ];

      mockSend.mockResolvedValueOnce({
        Messages: mockMessages,
      });

      const result = await sqsConsumerService.receiveMessages();

      expect(ReceiveMessageCommand).toHaveBeenCalledWith({
        QueueUrl: mockQueueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });

      expect(mockSend).toHaveBeenCalled();
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array when no messages are available', async () => {
      mockSend.mockResolvedValueOnce({
        Messages: undefined,
      });

      const result = await sqsConsumerService.receiveMessages();

      expect(ReceiveMessageCommand).toHaveBeenCalledWith({
        QueueUrl: mockQueueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });

      expect(mockSend).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw error when SQS client fails', async () => {
      const mockError = new Error('SQS Error');
      mockSend.mockRejectedValueOnce(mockError);

      await expect(sqsConsumerService.receiveMessages()).rejects.toThrow(mockError);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      const receiptHandle = 'test-receipt-handle';
      mockSend.mockResolvedValueOnce({});

      await sqsConsumerService.deleteMessage(receiptHandle);

      expect(DeleteMessageCommand).toHaveBeenCalledWith({
        QueueUrl: mockQueueUrl,
        ReceiptHandle: receiptHandle,
      });

      expect(mockSend).toHaveBeenCalled();
    });

    it('should throw error when delete fails', async () => {
      const receiptHandle = 'test-receipt-handle';
      const mockError = new Error('Delete Error');
      mockSend.mockRejectedValueOnce(mockError);

      await expect(sqsConsumerService.deleteMessage(receiptHandle)).rejects.toThrow(mockError);
    });
  });
});
