import { CreateProcessingJob } from '@/application/usecases/job/create-job';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { IProcessingJobRepository } from '@/domain/repository/job-repository';

jest.mock('@/domain/entities/processing-job');

describe('CreateProcessingJob UseCase', () => {
  let processingJobRepository: jest.Mocked<IProcessingJobRepository>;
  let createProcessingJob: CreateProcessingJob;
  let mockJob: ProcessingJob;

  beforeEach(() => {
    jest.clearAllMocks();

    processingJobRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    mockJob = {} as ProcessingJob;
    (ProcessingJob.create as jest.Mock).mockReturnValue(mockJob);

    createProcessingJob = new CreateProcessingJob(processingJobRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a processing job successfully', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
    };

    processingJobRepository.save.mockResolvedValue(undefined);

    // Act
    const result = await createProcessingJob.execute(input);

    // Assert
    expect(ProcessingJob.create).toHaveBeenCalledWith(input.videoId);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
    expect(result).toBe(mockJob);
  });

  it('should throw error if job repository save fails', async () => {
    // Arrange
    const input = {
      videoId: 'video-123',
    };

    const mockError = new Error('Failed to save job');
    processingJobRepository.save.mockRejectedValue(mockError);

    // Act & Assert
    await expect(createProcessingJob.execute(input)).rejects.toThrow(mockError);
    expect(ProcessingJob.create).toHaveBeenCalledWith(input.videoId);
    expect(processingJobRepository.save).toHaveBeenCalledWith(mockJob);
  });
});
