import { JobStatusHistory } from '@/domain/entities/job-status-history';
import { JobStatus } from '@/domain/enums/job-status';

describe('JobStatusHistory Entity', () => {
  const mockDate = new Date('2023-01-01');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a JobStatusHistory instance with the provided values', () => {
      const jobId = 'job-id-123';
      const status = JobStatus.QUEUED;

      const history = new JobStatusHistory(jobId, status);

      expect(history.jobId).toBe(jobId);
      expect(history.status).toBe(status);
      expect(history.changedAt).toBe(mockDate);
    });

    it('should create a JobStatusHistory with a custom changedAt date if provided', () => {
      const jobId = 'job-id-123';
      const status = JobStatus.RUNNING;
      const customDate = new Date('2023-02-01');

      const history = new JobStatusHistory(jobId, status, customDate);

      expect(history.jobId).toBe(jobId);
      expect(history.status).toBe(status);
      expect(history.changedAt).toBe(customDate);
    });

    it('should always set id to 0 as it is a required property for Entity but not used', () => {
      const history = new JobStatusHistory('job-id', JobStatus.QUEUED);

      expect(history.id).toBe(0);
    });
  });

  describe('restore static method', () => {
    it('should restore a JobStatusHistory instance from params', () => {
      const params = {
        jobId: 'job-id-123',
        status: JobStatus.COMPLETED,
        changedAt: mockDate,
      };

      const history = JobStatusHistory.restore(params);

      expect(history.jobId).toBe(params.jobId);
      expect(history.status).toBe(params.status);
      expect(history.changedAt).toBe(params.changedAt);
    });
  });

  describe('toJSON method', () => {
    it('should return a JSON representation of the job status history', () => {
      const jobId = 'job-id-123';
      const status = JobStatus.FAILED;

      const history = new JobStatusHistory(jobId, status, mockDate);

      const json = history.toJSON();

      expect(json).toEqual({
        jobId,
        status,
        changedAt: mockDate,
      });
    });
  });
});
