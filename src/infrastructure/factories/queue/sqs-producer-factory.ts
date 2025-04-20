import { SqsProducer } from '@/infrastructure/queue/sqs-producer';
import { SQSClient } from '@aws-sdk/client-sqs';

export const makeSqsProducer = () => {
  const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      sessionToken: process.env.AWS_SESSION_TOKEN || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const queueUrl = process.env.SQS_QUEUE_URL || '';

  return new SqsProducer(sqsClient, queueUrl);
};
