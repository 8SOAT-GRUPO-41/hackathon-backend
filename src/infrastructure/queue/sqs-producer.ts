import { IQueueService } from '@/application/ports/queue';
import { JobStatus } from '@/domain/enums/job-status';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export class SqsProducer implements IQueueService {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async sendMessage(
    videoId: string,
    videoName: string,
    status: JobStatus,
    failureReason?: string,
  ): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({ videoId, videoName, status, failureReason }),
        MessageGroupId: videoId,
        MessageDeduplicationId: videoId,
      }),
    );
  }
}
