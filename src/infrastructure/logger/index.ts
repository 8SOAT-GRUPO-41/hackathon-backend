import pino from 'pino';

export const logger = pino({
  name: 'hackathon-backend',
  level: process.env.LOG_LEVEL || 'info',
});
