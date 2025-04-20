import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { config } from 'dotenv';
import { logger } from '@/infrastructure/logger';

config();

export class SQSConsumerService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(queueUrl: string) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN || '',
      },
    });

    this.queueUrl = queueUrl;

    if (!this.queueUrl) {
      logger.warn('SQS_QUEUE_URL environment variable is not set');
    }
  }

  async receiveMessages(maxMessages = 10, waitTimeSeconds = 20) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
      });

      const response = await this.sqsClient.send(command);
      return response.Messages || [];
    } catch (error) {
      logger.error({ error }, 'Error receiving messages from SQS');
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      logger.info({ receiptHandle }, 'Message deleted from SQS');
    } catch (error) {
      logger.error({ error, receiptHandle }, 'Error deleting message from SQS');
      throw error;
    }
  }
}
