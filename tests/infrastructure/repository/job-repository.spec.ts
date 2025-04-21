import { ProcessingJob } from '@/domain/entities/processing-job';
import { ProcessingJobRepository } from '@/infrastructure/repository/job-repository';
import prisma from '@/infrastructure/prisma';

jest.mock('@/infrastructure/prisma', () => ({
  processingJob: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ProcessingJobRepository', () => {
  let processingJobRepository: ProcessingJobRepository;
  const mockJob = new ProcessingJob(
    'job-id',
    'video-id',
    new Date(),
    [],
    [],
    new Date(),
    undefined,
    undefined,
  );

  beforeEach(() => {
    processingJobRepository = new ProcessingJobRepository();
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should call prisma.processingJob.create with correct data', async () => {
      await processingJobRepository.save(mockJob);

      expect(prisma.processingJob.create).toHaveBeenCalledWith({
        data: {
          id: mockJob.id,
          videoId: mockJob.videoId,
          requestedAt: mockJob.requestedAt,
          startedAt: mockJob.startedAt,
          finishedAt: mockJob.finishedAt,
          errorMessage: mockJob.errorMessage,
          statusHistory: {
            create: mockJob.statusHistory.map((statusHistory) => ({
              jobId: statusHistory.jobId,
              status: statusHistory.status,
            })),
          },
        },
      });
    });
  });

  describe('findById', () => {
    it('should return null when job is not found', async () => {
      (prisma.processingJob.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await processingJobRepository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(prisma.processingJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        include: {
          statusHistory: true,
          Notification: true,
        },
      });
    });

    it('should return a ProcessingJob instance when job is found', async () => {
      (prisma.processingJob.findUnique as jest.Mock).mockResolvedValue({
        id: 'job-id',
        videoId: 'video-id',
        requestedAt: new Date(),
        startedAt: new Date(),
        finishedAt: null,
        errorMessage: null,
        statusHistory: [],
        Notification: [],
      });

      const result = await processingJobRepository.findById('job-id');

      expect(result).toBeInstanceOf(ProcessingJob);
      expect(result?.id).toBe('job-id');
      expect(result?.videoId).toBe('video-id');
      expect(prisma.processingJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        include: {
          statusHistory: true,
          Notification: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should call prisma.processingJob.delete with correct id', async () => {
      await processingJobRepository.delete(mockJob);

      expect(prisma.processingJob.delete).toHaveBeenCalledWith({
        where: { id: mockJob.id },
      });
    });
  });
});
