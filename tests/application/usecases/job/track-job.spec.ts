import { IQueueService } from '@/application/ports/queue';
import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { Notification } from '@/domain/entities/notification';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { User } from '@/domain/entities/user';
import { Video } from '@/domain/entities/video';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { NotFoundError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { IVideoRepository } from '@/domain/repository/video-repository';

jest.mock('@/domain/entities/notification');
jest.mock('@/domain/entities/processing-job');

describe('TrackProcessingJob UseCase', () => {
  let videoRepository: jest.Mocked<IVideoRepository>;
  let queueService: jest.Mocked<IQueueService>;
  let userRepository: jest.Mocked<IUserRepository>;
  let trackProcessingJob: TrackProcessingJob;
  let mockVideo: jest.Mocked<Video>;
  let mockJob: jest.Mocked<ProcessingJob>;
  let mockNotification: jest.Mocked<Notification>;
  let mockUser: jest.Mocked<User>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJob = {
      id: 'job-123',
      updateStatus: jest.fn(),
      addNotification: jest.fn(),
      get currentStatus() {
        return JobStatus.QUEUED;
      },
    } as unknown as jest.Mocked<ProcessingJob>;

    mockVideo = {
      id: 'video-123',
      userId: 'user-123',
      name: 'Test Video',
      get processingJob() {
        return mockJob;
      },
      addProcessingJob: jest.fn(),
    } as unknown as jest.Mocked<Video>;

    mockUser = {
      id: 'user-123',
      email: { value: 'test@example.com' },
    } as unknown as jest.Mocked<User>;

    mockNotification = {} as jest.Mocked<Notification>;
    (Notification.create as jest.Mock).mockReturnValue(mockNotification);
    (ProcessingJob.create as jest.Mock).mockReturnValue(mockJob);

    videoRepository = {
      findById: jest.fn().mockResolvedValue(mockVideo),
      save: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn(),
    };

    queueService = {
      sendNotification: jest.fn().mockResolvedValue(undefined),
    };

    userRepository = {
      findById: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
    };

    trackProcessingJob = new TrackProcessingJob(videoRepository, queueService, userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw NotFoundError if video is not found', async () => {
    // Arrange
    const input = {
      videoId: 'non-existent-video',
      jobStatus: JobStatus.RUNNING,
    };

    videoRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(trackProcessingJob.execute(input)).rejects.toThrow(
      new NotFoundError(`Video ${input.videoId} not found`),
    );
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(videoRepository.save).not.toHaveBeenCalled();
    expect(queueService.sendNotification).not.toHaveBeenCalled();
  });

  it('should create a new job if video has no processing job', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.QUEUED,
    };

    // Create a modified mock with undefined processingJob
    const videoWithoutJob = {
      ...mockVideo,
      get processingJob() {
        return undefined;
      },
    } as unknown as jest.Mocked<Video>;

    videoRepository.findById.mockResolvedValue(videoWithoutJob);

    // Act
    const result = await trackProcessingJob.execute(input);

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(ProcessingJob.create).toHaveBeenCalledWith(input.videoId);
    expect(videoWithoutJob.addProcessingJob).toHaveBeenCalledWith(mockJob);
    expect(videoRepository.save).toHaveBeenCalledWith(videoWithoutJob);
    expect(queueService.sendNotification).not.toHaveBeenCalled();
    expect(result).toEqual({
      video: videoWithoutJob,
      statusUpdated: true,
      currentStatus: mockJob.currentStatus,
    });
  });

  it('should update job status when video has an existing job', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.RUNNING,
    };

    // Create a modified mock with specific current status
    const jobWithQueuedStatus = {
      ...mockJob,
      get currentStatus() {
        return JobStatus.QUEUED;
      },
    } as unknown as jest.Mocked<ProcessingJob>;

    const videoWithQueuedJob = {
      ...mockVideo,
      get processingJob() {
        return jobWithQueuedStatus;
      },
    } as unknown as jest.Mocked<Video>;

    videoRepository.findById.mockResolvedValue(videoWithQueuedJob);

    // Act
    const result = await trackProcessingJob.execute(input);

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(jobWithQueuedStatus.updateStatus).toHaveBeenCalledWith(input.jobStatus);
    expect(videoRepository.save).toHaveBeenCalledWith(videoWithQueuedJob);
    expect(queueService.sendNotification).not.toHaveBeenCalled();
    expect(result).toEqual({
      video: videoWithQueuedJob,
      statusUpdated: true,
      currentStatus: jobWithQueuedStatus.currentStatus,
    });
  });

  it('should not create notification for non-terminal status', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.RUNNING,
    };

    // Act
    await trackProcessingJob.execute(input);

    // Assert
    expect(Notification.create).not.toHaveBeenCalled();
    expect(mockJob.addNotification).not.toHaveBeenCalled();
    expect(queueService.sendNotification).not.toHaveBeenCalled();
  });

  it('should create and send notification for COMPLETED status', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.COMPLETED,
    };

    // Act
    const result = await trackProcessingJob.execute(input);

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.jobStatus);
    expect(userRepository.findById).toHaveBeenCalledWith(mockVideo.userId);
    expect(Notification.create).toHaveBeenCalledWith({
      userId: mockVideo.userId,
      channel: Channel.EMAIL,
      payload: {
        status: input.jobStatus,
        videoId: mockVideo.id,
        videoName: mockVideo.name,
        notificationChannel: Channel.EMAIL,
      },
    });
    expect(mockJob.addNotification).toHaveBeenCalledWith(mockNotification);
    expect(mockNotification.userEmail).toBe(mockUser.email.value);
    expect(queueService.sendNotification).toHaveBeenCalledWith(mockNotification);
    expect(videoRepository.save).toHaveBeenCalledWith(mockVideo);
    expect(result).toEqual({
      video: mockVideo,
      statusUpdated: true,
      currentStatus: mockJob.currentStatus,
    });
  });

  it('should create and send notification for FAILED status', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.FAILED,
    };

    // Act
    const result = await trackProcessingJob.execute(input);

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.jobStatus);
    expect(userRepository.findById).toHaveBeenCalledWith(mockVideo.userId);
    expect(Notification.create).toHaveBeenCalledWith({
      userId: mockVideo.userId,
      channel: Channel.EMAIL,
      payload: {
        status: input.jobStatus,
        videoId: mockVideo.id,
        videoName: mockVideo.name,
        notificationChannel: Channel.EMAIL,
      },
    });
    expect(mockJob.addNotification).toHaveBeenCalledWith(mockNotification);
    expect(mockNotification.userEmail).toBe(mockUser.email.value);
    expect(queueService.sendNotification).toHaveBeenCalledWith(mockNotification);
    expect(videoRepository.save).toHaveBeenCalledWith(mockVideo);
    expect(result).toEqual({
      video: mockVideo,
      statusUpdated: true,
      currentStatus: mockJob.currentStatus,
    });
  });

  it('should handle missing user when creating notification', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.COMPLETED,
    };

    userRepository.findById.mockResolvedValue(null);

    // Act
    const result = await trackProcessingJob.execute(input);

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(mockVideo.userId);
    expect(Notification.create).toHaveBeenCalledWith({
      userId: mockVideo.userId,
      channel: Channel.EMAIL,
      payload: {
        status: input.jobStatus,
        videoId: mockVideo.id,
        videoName: mockVideo.name,
        notificationChannel: Channel.EMAIL,
      },
    });
    expect(mockJob.addNotification).toHaveBeenCalledWith(mockNotification);
    expect(mockNotification.userEmail).toBeUndefined();
    expect(queueService.sendNotification).toHaveBeenCalledWith(mockNotification);
    expect(result).toEqual({
      video: mockVideo,
      statusUpdated: true,
      currentStatus: mockJob.currentStatus,
    });
  });

  it('should handle errors from queueService.sendNotification', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
      jobStatus: JobStatus.COMPLETED,
    };

    const mockError = new Error('Failed to send notification');
    queueService.sendNotification.mockRejectedValue(mockError);

    // Act & Assert
    await expect(trackProcessingJob.execute(input)).rejects.toThrow(mockError);
    expect(videoRepository.findById).toHaveBeenCalledWith(input.videoId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.jobStatus);
    expect(queueService.sendNotification).toHaveBeenCalledWith(mockNotification);
    expect(videoRepository.save).toHaveBeenCalledWith(mockVideo);
  });
});
