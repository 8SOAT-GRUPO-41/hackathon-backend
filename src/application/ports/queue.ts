import { Notification } from '@/domain/entities/notification';

export interface IQueueService {
  sendNotification(notification: Notification): Promise<void>;
}
