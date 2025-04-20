import { IQueueService } from '@/application/ports/queue';
import { Notification, NotificationPayload } from '@/domain/entities/notification';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

type QueueMessageType<T> = {
  groupId: string;
  deduplicationId: string;
  payload: T;
};

export class SqsProducer implements IQueueService {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async sendNotification(notification: Notification): Promise<void> {
    await this.sendMessage<NotificationPayload>({
      deduplicationId: notification.id,
      groupId: notification.userId,
      payload: notification.payload,
    });
  }

  async sendMessage<T>(message: QueueMessageType<T>): Promise<void> {
    const { payload } = message;

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
      }),
    );
  }
}
