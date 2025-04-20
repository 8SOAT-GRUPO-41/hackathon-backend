import { config } from 'dotenv';
import { FastifyHttpServer } from '@/infrastructure/http/fastify/server';
import { SQSConsumer } from '@/infrastructure/consumers/sqs-consumer';
import { logger } from '@/infrastructure/logger';

config();

export const server = new FastifyHttpServer();
server.listen(+(process.env.PORT || 3000));

const sqsConsumer = new SQSConsumer(process.env.SQS_QUEUE_URL!);
sqsConsumer.start().catch((error) => {
  logger.error({ error }, 'Failed to start SQS consumer');
});

process.on('SIGINT', async () => {
  logger.info('Application shutdown requested');
  sqsConsumer.stop();
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Application termination requested');
  sqsConsumer.stop();
  await server.close();
  process.exit(0);
});
