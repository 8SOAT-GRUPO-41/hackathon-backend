import { Notification, NotificationPayload } from '@/domain/entities/notification';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';

describe('Notification Entity', () => {
  const mockDate = new Date('2023-01-01');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockPayload: NotificationPayload = {
    status: JobStatus.QUEUED,
    videoId: 'video-id-123',
    videoName: 'Test Video',
    notificationChannel: Channel.EMAIL,
  };

  describe('constructor', () => {
    it('should create a Notification instance with the provided values', () => {
      const id = 'notification-id-123';
      const userId = 'user-id-456';
      const channel = Channel.EMAIL;
      const jobId = 'job-id-789';

      const notification = new Notification(id, userId, channel, mockPayload, mockDate, jobId);

      expect(notification.id).toBe(id);
      expect(notification.userId).toBe(userId);
      expect(notification.channel).toBe(channel);
      expect(notification.payload).toBe(mockPayload);
      expect(notification.sentAt).toBe(mockDate);
      expect(notification.jobId).toBe(jobId);
      expect(notification.userEmail).toBeUndefined();
    });

    it('should create a Notification without jobId if not provided', () => {
      const notification = new Notification(
        'notification-id',
        'user-id',
        Channel.EMAIL,
        mockPayload,
      );

      expect(notification.jobId).toBeUndefined();
    });
  });

  describe('create static method', () => {
    it('should create a new Notification with a random UUID', () => {
      const mockUuid = '12345678-1234-1234-1234-123456789012';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockUuid);

      const params = {
        userId: 'user-id-456',
        channel: Channel.EMAIL,
        payload: mockPayload,
        jobId: 'job-id-789',
      };

      const notification = Notification.create(params);

      expect(notification.id).toBe(mockUuid);
      expect(notification.userId).toBe(params.userId);
      expect(notification.channel).toBe(params.channel);
      expect(notification.payload).toBe(params.payload);
      expect(notification.sentAt).toBe(mockDate);
      expect(notification.jobId).toBe(params.jobId);
    });

    it('should create a Notification without jobId if not provided in params', () => {
      const params = {
        userId: 'user-id-456',
        channel: Channel.EMAIL,
        payload: mockPayload,
      };

      const notification = Notification.create(params);

      expect(notification.jobId).toBeUndefined();
    });
  });

  describe('restore static method', () => {
    it('should restore a Notification instance from params', () => {
      const params = {
        id: 'notification-id-123',
        userId: 'user-id-456',
        channel: Channel.SMS,
        payload: mockPayload,
        sentAt: new Date('2023-02-01'),
        jobId: 'job-id-789',
      };

      const notification = Notification.restore(params);

      expect(notification.id).toBe(params.id);
      expect(notification.userId).toBe(params.userId);
      expect(notification.channel).toBe(params.channel);
      expect(notification.payload).toBe(params.payload);
      expect(notification.sentAt).toBe(params.sentAt);
      expect(notification.jobId).toBe(params.jobId);
    });

    it('should restore a Notification without jobId if not provided in params', () => {
      const params = {
        id: 'notification-id-123',
        userId: 'user-id-456',
        channel: Channel.WEBHOOK,
        payload: mockPayload,
        sentAt: mockDate,
      };

      const notification = Notification.restore(params);

      expect(notification.jobId).toBeUndefined();
    });
  });

  describe('userEmail getter and setter', () => {
    it('should initially return undefined for userEmail', () => {
      const notification = new Notification('notification-id', 'user-id', Channel.EMAIL, {
        ...mockPayload,
      });

      expect(notification.userEmail).toBeUndefined();
    });

    it('should set userEmail property and update payload when setter is used', () => {
      const notification = new Notification('notification-id', 'user-id', Channel.EMAIL, {
        ...mockPayload,
      });

      const email = 'user@example.com';
      notification.userEmail = email;

      expect(notification.userEmail).toBe(email);
      expect(notification.payload.email).toBe(email);
    });

    it('should allow setting userEmail to undefined', () => {
      const notification = new Notification('notification-id', 'user-id', Channel.EMAIL, {
        ...mockPayload,
        email: 'user@example.com',
      });

      notification.userEmail = undefined;

      expect(notification.userEmail).toBeUndefined();
      expect(notification.payload.email).toBeUndefined();
    });
  });
});
