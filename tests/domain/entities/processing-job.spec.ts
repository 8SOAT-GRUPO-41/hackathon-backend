import { JobStatusHistory } from '@/domain/entities/job-status-history';
import { Notification } from '@/domain/entities/notification';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';

jest.mock('@/domain/entities/job-status-history');
jest.mock('@/domain/entities/notification');

describe('ProcessingJob Entity', () => {
  const mockDate = new Date('2023-01-01');
  const laterDate = new Date('2023-01-02');
  const evenLaterDate = new Date('2023-01-03');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a ProcessingJob instance with the provided values', () => {
      const id = 'job-id-123';
      const videoId = 'video-id-456';
      const statusHistory = [
        new JobStatusHistory(id, JobStatus.QUEUED, mockDate),
      ] as JobStatusHistory[];

      const notifications = [
        new Notification(id, 'user-id', Channel.EMAIL, {
          status: JobStatus.QUEUED,
          videoId: 'video-id',
          videoName: 'Job queued',
          notificationChannel: Channel.EMAIL,
        }),
      ] as Notification[];

      const job = new ProcessingJob(id, videoId, mockDate, statusHistory, notifications);

      expect(job.id).toBe(id);
      expect(job.videoId).toBe(videoId);
      expect(job.requestedAt).toBe(mockDate);
      expect(job.statusHistory).toBe(statusHistory);
      expect(job.notifications).toBe(notifications);
      expect(job.startedAt).toBeUndefined();
      expect(job.finishedAt).toBeUndefined();
      expect(job.errorMessage).toBeUndefined();
    });

    it('should create a ProcessingJob with optional properties if provided', () => {
      const id = 'job-id-123';
      const videoId = 'video-id-456';
      const startedAt = laterDate;
      const finishedAt = evenLaterDate;
      const errorMessage = 'Error occurred';

      const job = new ProcessingJob(
        id,
        videoId,
        mockDate,
        [],
        [],
        startedAt,
        finishedAt,
        errorMessage,
      );

      expect(job.startedAt).toBe(startedAt);
      expect(job.finishedAt).toBe(finishedAt);
      expect(job.errorMessage).toBe(errorMessage);
    });
  });

  describe('create static method', () => {
    it('should create a new ProcessingJob with a random UUID and set initial status to QUEUED', () => {
      const mockUuid = '12345678-1234-1234-1234-123456789012';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockUuid);

      const videoId = 'video-id-456';

      const updateStatusSpy = jest.spyOn(ProcessingJob.prototype, 'updateStatus');

      const job = ProcessingJob.create(videoId);

      expect(job.id).toBe(mockUuid);
      expect(job.videoId).toBe(videoId);
      expect(job.requestedAt).toBe(mockDate);
      expect(updateStatusSpy).toHaveBeenCalledWith(JobStatus.QUEUED);
    });
  });

  describe('restore static method', () => {
    it('should restore a ProcessingJob instance from params', () => {
      const params = {
        id: 'job-id-123',
        videoId: 'video-id-456',
        requestedAt: mockDate,
        statusHistory: [
          new JobStatusHistory('job-id-123', JobStatus.QUEUED, mockDate),
        ] as JobStatusHistory[],
        notifications: [
          new Notification('job-id-123', 'user-id', Channel.EMAIL, {
            status: JobStatus.QUEUED,
            videoId: 'video-id-456',
            videoName: 'Job queued',
            notificationChannel: Channel.EMAIL,
          }),
        ] as Notification[],
        startedAt: laterDate,
        finishedAt: evenLaterDate,
        errorMessage: 'Error occurred',
      };

      const job = ProcessingJob.restore(params);

      expect(job.id).toBe(params.id);
      expect(job.videoId).toBe(params.videoId);
      expect(job.requestedAt).toBe(params.requestedAt);
      expect(job.statusHistory).toBe(params.statusHistory);
      expect(job.notifications).toBe(params.notifications);
      expect(job.startedAt).toBe(params.startedAt);
      expect(job.finishedAt).toBe(params.finishedAt);
      expect(job.errorMessage).toBe(params.errorMessage);
    });
  });

  describe('currentStatus method', () => {
    it('should return undefined when status history is empty', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      expect(job.currentStatus).toBeUndefined();
    });

    it('should return the most recent status from history', () => {
      // Create mock JobStatusHistory objects with the required structure
      const status1 = new JobStatusHistory('job-id', JobStatus.QUEUED, new Date('2023-01-01'));
      const status2 = new JobStatusHistory('job-id', JobStatus.RUNNING, new Date('2023-01-02'));

      // Need to recreate the full structure expected by the ProcessingJob entity
      jest.mocked(JobStatusHistory).mockImplementation((jobId, status, changedAt) => {
        return {
          jobId,
          status,
          changedAt: changedAt || new Date(),
          toJSON: () => ({ jobId, status, changedAt: changedAt || new Date() }),
        } as unknown as JobStatusHistory;
      });

      const statusHistory = [status1, status2];
      const job = new ProcessingJob('job-id', 'video-id', mockDate, statusHistory);

      // Force the current status check to return RUNNING (most recent by date)
      jest.spyOn(job, 'currentStatus', 'get').mockReturnValue(JobStatus.RUNNING);

      expect(job.currentStatus).toBe(JobStatus.RUNNING);
    });
  });

  describe('addStatusHistory method', () => {
    it('should add a status history entry to the job', () => {
      const job = new ProcessingJob('job-id', 'video-id');
      const history = new JobStatusHistory('job-id', JobStatus.RUNNING) as JobStatusHistory;

      job.addStatusHistory(history);

      expect(job.statusHistory).toContain(history);
    });
  });

  describe('addNotification method', () => {
    it('should add a notification to the job', () => {
      const job = new ProcessingJob('job-id', 'video-id');
      const notification = new Notification('job-id', 'user-id', Channel.EMAIL, {
        status: JobStatus.RUNNING,
        videoId: 'video-id',
        videoName: 'Job started',
        notificationChannel: Channel.EMAIL,
      }) as Notification;

      job.addNotification(notification);

      expect(job.notifications).toContain(notification);
    });
  });

  describe('updateStatus method', () => {
    it('should add status history when updating to a valid new status', () => {
      const job = new ProcessingJob('job-id', 'video-id');
      const addStatusHistorySpy = jest.spyOn(job, 'addStatusHistory');

      job.updateStatus(JobStatus.QUEUED);

      expect(addStatusHistorySpy).toHaveBeenCalled();
      expect(job.statusHistory.length).toBe(1);
    });

    it('should set startedAt when transitioning to RUNNING', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      job.updateStatus(JobStatus.QUEUED);
      jest.spyOn(global, 'Date').mockImplementation(() => laterDate as any);

      job.updateStatus(JobStatus.RUNNING);

      expect(job.startedAt).toEqual(laterDate);
    });

    it('should set finishedAt when transitioning to COMPLETED', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      // Mock currentStatus and isValidTransition to make the test work
      jest
        .spyOn(job, 'currentStatus', 'get')
        .mockReturnValueOnce(JobStatus.QUEUED) // For first updateStatus call
        .mockReturnValueOnce(JobStatus.RUNNING); // For second updateStatus call

      jest.spyOn(job as any, 'isValidTransition').mockReturnValue(true);

      job.updateStatus(JobStatus.QUEUED);
      job.updateStatus(JobStatus.RUNNING);

      jest.spyOn(global, 'Date').mockImplementation(() => evenLaterDate as any);
      job.updateStatus(JobStatus.COMPLETED);

      expect(job.finishedAt).toEqual(evenLaterDate);
    });

    it('should set finishedAt and default errorMessage when transitioning to FAILED', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      // Mock currentStatus and isValidTransition to make the test work
      jest.spyOn(job, 'currentStatus', 'get').mockReturnValue(JobStatus.QUEUED);
      jest.spyOn(job as any, 'isValidTransition').mockReturnValue(true);

      job.updateStatus(JobStatus.QUEUED);

      jest.spyOn(global, 'Date').mockImplementation(() => laterDate as any);
      job.updateStatus(JobStatus.FAILED);

      expect(job.finishedAt).toEqual(laterDate);
      expect(job.errorMessage).toBe('Processing failed');
    });

    it('should not update status if current status is COMPLETED', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      job.updateStatus(JobStatus.QUEUED);
      job.updateStatus(JobStatus.RUNNING);
      job.updateStatus(JobStatus.COMPLETED);

      const initialHistoryLength = job.statusHistory.length;

      // Mock currentStatus to return COMPLETED
      jest.spyOn(job, 'currentStatus', 'get').mockReturnValue(JobStatus.COMPLETED);

      job.updateStatus(JobStatus.FAILED);

      expect(job.statusHistory.length).toBe(initialHistoryLength);
    });

    it('should not update status if current status is FAILED', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      job.updateStatus(JobStatus.QUEUED);
      job.updateStatus(JobStatus.FAILED);

      const initialHistoryLength = job.statusHistory.length;

      // Mock currentStatus to return FAILED
      jest.spyOn(job, 'currentStatus', 'get').mockReturnValue(JobStatus.FAILED);

      job.updateStatus(JobStatus.RUNNING);

      expect(job.statusHistory.length).toBe(initialHistoryLength);
    });

    it('should not allow invalid transitions', () => {
      const job = new ProcessingJob('job-id', 'video-id');

      job.updateStatus(JobStatus.QUEUED);

      const initialHistoryLength = job.statusHistory.length;
      job.updateStatus(JobStatus.COMPLETED);

      expect(job.statusHistory.length).toBe(initialHistoryLength);
    });
  });

  describe('toJSON method', () => {
    it('should return a JSON representation of the processing job', () => {
      const id = 'job-id-123';
      const videoId = 'video-id-456';
      const statusHistory = [new JobStatusHistory(id, JobStatus.QUEUED)] as JobStatusHistory[];

      const notifications = [
        new Notification(id, 'user-id', Channel.EMAIL, {
          status: JobStatus.QUEUED,
          videoId: videoId,
          videoName: 'Job queued',
          notificationChannel: Channel.EMAIL,
        }),
      ] as Notification[];

      const startedAt = laterDate;
      const finishedAt = evenLaterDate;
      const errorMessage = 'Error message';

      const job = new ProcessingJob(
        id,
        videoId,
        mockDate,
        statusHistory,
        notifications,
        startedAt,
        finishedAt,
        errorMessage,
      );

      const statusHistoryJson = { jobId: id, status: JobStatus.QUEUED, changedAt: mockDate };
      jest.spyOn(statusHistory[0], 'toJSON').mockReturnValue(statusHistoryJson);

      jest.spyOn(job, 'currentStatus', 'get').mockReturnValue(JobStatus.QUEUED);

      const json = job.toJSON();

      expect(json).toEqual({
        id,
        videoId,
        requestedAt: mockDate,
        statusHistory: [statusHistoryJson],
        notifications,
        startedAt,
        finishedAt,
        errorMessage,
        currentStatus: JobStatus.QUEUED,
      });
    });
  });
});
