import { Notification } from '@/domain/entities/notification'

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>
  findByUserId(userId: string): Promise<Notification[]>
  save(notification: Notification): Promise<void>
  delete(notification: Notification): Promise<void>
}
