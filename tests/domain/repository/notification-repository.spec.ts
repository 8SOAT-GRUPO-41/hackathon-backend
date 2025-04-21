import { Notification, NotificationPayload } from '@/domain/entities/notification';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { INotificationRepository } from '@/domain/repository/notification-repository';

class MockNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async save(notification: Notification): Promise<void> {
    const index = this.notifications.findIndex((n) => n.id === notification.id);
    if (index >= 0) {
      this.notifications[index] = notification;
    } else {
      this.notifications.push(notification);
    }
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.find((n) => n.id === id) || null;
  }

  async delete(notification: Notification): Promise<void> {
    this.notifications = this.notifications.filter((n) => n.id !== notification.id);
  }
}

describe('NotificationRepository Interface', () => {
  let repository: INotificationRepository;
  let mockPayload: NotificationPayload;
  let notification: Notification;
  const userId = 'user-id-123';
  const jobId = 'job-id-456';

  beforeEach(() => {
    repository = new MockNotificationRepository();

    mockPayload = {
      status: JobStatus.QUEUED,
      videoId: 'video-id-123',
      videoName: 'Test Video',
      notificationChannel: Channel.EMAIL,
    };

    notification = new Notification(
      'notification-id-123',
      userId,
      Channel.EMAIL,
      mockPayload,
      new Date(),
      jobId,
    );
  });

  describe('findByUserId', () => {
    it('should return all notifications for a user', async () => {
      const notification1 = new Notification(
        'notification-id-1',
        userId,
        Channel.EMAIL,
        { ...mockPayload },
        new Date(),
      );

      const notification2 = new Notification(
        'notification-id-2',
        userId,
        Channel.SMS,
        { ...mockPayload, notificationChannel: Channel.SMS },
        new Date(),
      );

      await repository.save(notification1);
      await repository.save(notification2);

      const notifications = await repository.findByUserId(userId);

      expect(notifications).toHaveLength(2);
      expect(notifications).toContain(notification1);
      expect(notifications).toContain(notification2);
    });

    it('should return an empty array when no notifications are found for the user', async () => {
      const notifications = await repository.findByUserId('non-existent-user-id');

      expect(notifications).toHaveLength(0);
    });
  });

  describe('save', () => {
    it('should add a new notification when it does not exist', async () => {
      await repository.save(notification);

      const notifications = await repository.findByUserId(userId);

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toBe(notification);
    });

    it('should update an existing notification', async () => {
      await repository.save(notification);

      // Update the notification with a new email
      notification.userEmail = 'user@example.com';

      await repository.save(notification);

      const notifications = await repository.findByUserId(userId);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].userEmail).toBe('user@example.com');
      expect(notifications[0].payload.email).toBe('user@example.com');
    });
  });
});
