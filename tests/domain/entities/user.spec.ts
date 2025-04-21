import { Notification } from '@/domain/entities/notification';
import { User } from '@/domain/entities/user';
import { Video } from '@/domain/entities/video';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

jest.mock('@/domain/entities/video');
jest.mock('@/domain/entities/notification');
jest.mock('@/domain/value-objects/user-password');

describe('User Entity', () => {
  const mockEmail = new UserEmail('test@example.com');
  const mockPassword = UserPassword.fromHash('hashedpassword');
  const mockDate = new Date('2023-01-01');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a User instance with the provided values', () => {
      const id = 'user-id-123';
      const user = new User(id, mockEmail, mockPassword, mockDate);

      expect(user.id).toBe(id);
      expect(user.email).toBe(mockEmail);
      expect(user.password).toBe(mockPassword);
      expect(user.createdAt).toBe(mockDate);
      expect(user.videos).toEqual([]);
      expect(user.notifications).toEqual([]);
    });

    it('should create a User with videos and notifications if provided', () => {
      const mockVideos = [
        new Video('video-id', 'user-id', 'title', 'original-key', 'result-key', 'description'),
      ] as Video[];

      const mockNotifications = [
        new Notification('notification-id', 'user-id', Channel.EMAIL, {
          status: JobStatus.QUEUED,
          videoId: 'video-id',
          videoName: 'Video Name',
          notificationChannel: Channel.EMAIL,
        }),
      ] as Notification[];

      const user = new User(
        'user-id',
        mockEmail,
        mockPassword,
        mockDate,
        mockVideos,
        mockNotifications,
      );

      expect(user.videos).toBe(mockVideos);
      expect(user.notifications).toBe(mockNotifications);
    });
  });

  describe('create static method', () => {
    it('should create a new User with a random UUID', () => {
      const mockUuid = '12345678-1234-1234-1234-123456789012';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockUuid);

      const user = User.create(mockEmail, mockPassword);

      expect(user.id).toBe(mockUuid);
      expect(user.email).toBe(mockEmail);
      expect(user.password).toBe(mockPassword);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.videos).toEqual([]);
      expect(user.notifications).toEqual([]);
    });
  });

  describe('addVideo method', () => {
    it('should add a video to the user videos array', () => {
      const user = new User('user-id', mockEmail, mockPassword);
      const mockVideo = new Video(
        'video-id',
        'user-id',
        'title',
        'original-key',
        'result-key',
      ) as Video;

      user.addVideo(mockVideo);

      expect(user.videos).toHaveLength(1);
      expect(user.videos[0]).toBe(mockVideo);
    });
  });

  describe('addNotification method', () => {
    it('should add a notification to the user notifications array', () => {
      const user = new User('user-id', mockEmail, mockPassword);
      const mockNotification = new Notification('notification-id', 'user-id', Channel.EMAIL, {
        status: JobStatus.QUEUED,
        videoId: 'video-id',
        videoName: 'Video Name',
        notificationChannel: Channel.EMAIL,
      }) as Notification;

      user.addNotification(mockNotification);

      expect(user.notifications).toHaveLength(1);
      expect(user.notifications[0]).toBe(mockNotification);
    });
  });
});
