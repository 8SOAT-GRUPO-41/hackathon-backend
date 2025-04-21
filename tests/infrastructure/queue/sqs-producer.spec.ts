import { Notification } from '@/domain/entities/notification';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { SqsProducer } from '@/infrastructure/queue/sqs-producer';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    SendMessageCommand: jest.fn(),
  };
});

describe('SqsProducer', () => {
  let sqsProducer: SqsProducer;
  let sqsClientMock: jest.Mocked<SQSClient>;
  const queueUrl = 'https://test-queue-url.com';

  beforeEach(() => {
    jest.clearAllMocks();
    sqsClientMock = new SQSClient({}) as jest.Mocked<SQSClient>;
    sqsProducer = new SqsProducer(sqsClientMock, queueUrl);
  });

  describe('sendNotification', () => {
    it('should call sendMessage with notification details', async () => {
      const payload = {
        status: JobStatus.COMPLETED,
        videoId: 'video-id',
        videoName: 'test-video.mp4',
        notificationChannel: Channel.EMAIL,
      };

      const notification = new Notification('notification-id', 'user-id', Channel.EMAIL, payload);

      const spy = jest.spyOn(sqsProducer as any, 'sendMessage');

      await sqsProducer.sendNotification(notification);

      expect(spy).toHaveBeenCalledWith({
        deduplicationId: 'notification-id',
        groupId: 'user-id',
        payload: notification.payload,
      });
    });
  });

  describe('sendMessage', () => {
    it('should send a message with the correct parameters', async () => {
      const message = {
        deduplicationId: 'dedup-id',
        groupId: 'group-id',
        payload: { data: 'test-data' },
      };

      await sqsProducer.sendMessage(message);

      expect(SendMessageCommand).toHaveBeenCalledWith({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message.payload),
      });

      expect(sqsClientMock.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });
  });
});
