import { UpdateProcessingJob } from '@/application/usecases/job/update-job';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { JobStatus } from '@/domain/enums/job-status';
import { IProcessingJobRepository } from '@/domain/repository/job-repository';

describe('UpdateProcessingJob UseCase', () => {
  let processingJobRepository: jest.Mocked<IProcessingJobRepository>;
  let updateProcessingJob: UpdateProcessingJob;
  let mockJob: jest.Mocked<ProcessingJob>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJob = {
      id: 'job-123',
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ProcessingJob>;

    processingJobRepository = {
      findById: jest.fn().mockResolvedValue(mockJob),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
    };

    updateProcessingJob = new UpdateProcessingJob(processingJobRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update a processing job status successfully', async () => {
    // Arrange
    const input = {
      jobId: 'job-123',
      status: JobStatus.RUNNING,
    };

    // Act
    const result = await updateProcessingJob.execute(input);

    // Assert
    expect(processingJobRepository.findById).toHaveBeenCalledWith(input.jobId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.status);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
    expect(result).toBe(mockJob);
  });

  it('should throw error if job is not found', async () => {
    // Arrange
    const input = {
      jobId: 'non-existent-job',
      status: JobStatus.RUNNING,
    };

    processingJobRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(updateProcessingJob.execute(input)).rejects.toThrow('Job not found');
    expect(processingJobRepository.findById).toHaveBeenCalledWith(input.jobId);
    expect(mockJob.updateStatus).not.toHaveBeenCalled();
    expect(processingJobRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if job repository save fails', async () => {
    // Arrange
    const input = {
      jobId: 'job-123',
      status: JobStatus.COMPLETED,
    };

    const mockError = new Error('Failed to save job');
    processingJobRepository.save.mockRejectedValue(mockError);

    // Act & Assert
    await expect(updateProcessingJob.execute(input)).rejects.toThrow(mockError);
    expect(processingJobRepository.findById).toHaveBeenCalledWith(input.jobId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.status);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
  });

  it('should update status to COMPLETED successfully', async () => {
    // Arrange
    const input = {
      jobId: 'job-123',
      status: JobStatus.COMPLETED,
    };

    // Act
    const result = await updateProcessingJob.execute(input);

    // Assert
    expect(processingJobRepository.findById).toHaveBeenCalledWith(input.jobId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.status);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
    expect(result).toBe(mockJob);
  });

  it('should update status to FAILED successfully', async () => {
    // Arrange
    const input = {
      jobId: 'job-123',
      status: JobStatus.FAILED,
    };

    // Act
    const result = await updateProcessingJob.execute(input);

    // Assert
    expect(processingJobRepository.findById).toHaveBeenCalledWith(input.jobId);
    expect(mockJob.updateStatus).toHaveBeenCalledWith(input.status);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
    expect(result).toBe(mockJob);
  });
});
