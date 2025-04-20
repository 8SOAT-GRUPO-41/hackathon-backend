/* eslint-disable max-len */
import { makeTrackProcessingJobController } from '@/infrastructure/factories/controller/track-processing-job-controller-factory';
import { logger } from '@/infrastructure/logger';
import { SQSConsumerService } from '@/infrastructure/services/sqs-consumer-service';

export class SQSConsumer {
  private readonly sqsService: SQSConsumerService;
  private isRunning: boolean = false;
  private readonly pollingIntervalMs: number;

  constructor(
    private readonly queueUrl: string,
    pollingIntervalMs = 0,
  ) {
    this.sqsService = new SQSConsumerService(this.queueUrl);
    this.pollingIntervalMs = pollingIntervalMs;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('SQS consumer is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting SQS consumer');

    while (this.isRunning) {
      try {
        const messages = await this.sqsService.receiveMessages();

        if (messages.length > 0) {
          logger.info({ count: messages.length }, 'Received messages from SQS');

          const controller = makeTrackProcessingJobController();
          const processPromises = messages.map(async (message) => {
            try {
              logger.info({ message }, 'Processing message');
              if (!message.Body || !message.MessageId) {
                logger.warn({ messageId: message.MessageId }, 'Message body is empty');
                return;
              }

              const result = await controller.handle({
                messageId: message.MessageId,
                body: JSON.parse(message.Body),
              });

              if (result.success && message.ReceiptHandle) {
                await this.sqsService.deleteMessage(message.ReceiptHandle);
              }
            } catch (error) {
              logger.error({ error, messageId: message.MessageId }, 'Error processing message');
            }
          });

          await Promise.all(processPromises);
        }

        if (this.pollingIntervalMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.pollingIntervalMs));
        }
      } catch (error) {
        logger.error({ error }, 'Error in SQS consumer polling cycle');

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  stop(): void {
    if (!this.isRunning) {
      logger.warn('SQS consumer is not running');
      return;
    }

    this.isRunning = false;
    logger.info('Stopping SQS consumer');
  }
}
