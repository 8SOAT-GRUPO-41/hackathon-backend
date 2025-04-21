import { ProcessingJob } from '@/domain/entities/processing-job';
import { Video } from '@/domain/entities/video';

jest.mock('@/domain/entities/processing-job');

describe('Video Entity', () => {
  const mockDate = new Date('2023-01-01');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a Video instance with the provided values', () => {
      const id = 'video-id-123';
      const userId = 'user-id-456';
      const name = 'Test Video';
      const originalKey = 'original/path.mp4';
      const resultKey = 'frames/video-id-123.zip';
      const description = 'Test description';

      const video = new Video(id, userId, name, originalKey, resultKey, description, mockDate);

      expect(video.id).toBe(id);
      expect(video.userId).toBe(userId);
      expect(video.name).toBe(name);
      expect(video.originalKey).toBe(originalKey);
      expect(video.resultKey).toBe(resultKey);
      expect(video.description).toBe(description);
      expect(video.createdAt).toBe(mockDate);
      expect(video.processingJob).toBeUndefined();
      expect(video.presignedUrl).toBeUndefined();
    });

    it('should create a Video with processing job and presigned URL if provided', () => {
      const mockProcessingJob = new ProcessingJob('job-id', 'video-id') as ProcessingJob;
      const presignedUrl = 'https://example.com/video.mp4';

      const video = new Video(
        'video-id',
        'user-id',
        'Video Name',
        'original/key.mp4',
        'frames/result.zip',
        'Description',
        mockDate,
        mockProcessingJob,
        presignedUrl,
      );

      expect(video.processingJob).toBe(mockProcessingJob);
      expect(video.presignedUrl).toBe(presignedUrl);
    });
  });

  describe('create static method', () => {
    it('should create a new Video with generated id and keys', () => {
      const mockUuid = '12345678-1234-1234-1234-123456789012';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockUuid);

      const userId = 'user-id-456';
      const name = 'Test Video';
      const description = 'Test description';

      const video = Video.create(userId, name, description);

      expect(video.id).toBe(mockUuid);
      expect(video.userId).toBe(userId);
      expect(video.name).toBe(name);
      expect(video.description).toBe(description);
      expect(video.originalKey).toBe(`raw/${mockUuid}.mp4`);
      expect(video.resultKey).toBe(`frames/${mockUuid}.zip`);
      expect(video.createdAt).toBe(mockDate);
    });
  });

  describe('restore static method', () => {
    it('should restore a Video instance from params', () => {
      const params = {
        id: 'video-id-123',
        userId: 'user-id-456',
        name: 'Restored Video',
        originalKey: 'raw/video-id-123.mp4',
        resultKey: 'frames/video-id-123.zip',
        description: 'Restored description',
        createdAt: mockDate,
        processingJob: new ProcessingJob('job-id', 'video-id') as ProcessingJob,
        presignedUrl: 'https://example.com/video.mp4',
      };

      const video = Video.restore(params);

      expect(video.id).toBe(params.id);
      expect(video.userId).toBe(params.userId);
      expect(video.name).toBe(params.name);
      expect(video.originalKey).toBe(params.originalKey);
      expect(video.resultKey).toBe(params.resultKey);
      expect(video.description).toBe(params.description);
      expect(video.createdAt).toBe(params.createdAt);
      expect(video.processingJob).toBe(params.processingJob);
      expect(video.presignedUrl).toBe(params.presignedUrl);
    });
  });

  describe('setPresignedUrl method', () => {
    it('should set the presigned URL', () => {
      const video = new Video(
        'video-id',
        'user-id',
        'Video Name',
        'original/key.mp4',
        'frames/result.zip',
      );

      const url = 'https://example.com/presigned-url';
      video.setPresignedUrl(url);

      expect(video.presignedUrl).toBe(url);
    });
  });

  describe('addProcessingJob method', () => {
    it('should add a processing job to the video', () => {
      const video = new Video(
        'video-id',
        'user-id',
        'Video Name',
        'original/key.mp4',
        'frames/result.zip',
      );

      const processingJob = new ProcessingJob('job-id', 'video-id') as ProcessingJob;
      video.addProcessingJob(processingJob);

      expect(video.processingJob).toBe(processingJob);
    });
  });

  describe('toJSON method', () => {
    it('should return a JSON representation of the video', () => {
      const id = 'video-id-123';
      const userId = 'user-id-456';
      const name = 'Test Video';
      const originalKey = 'original/path.mp4';
      const resultKey = 'frames/video-id-123.zip';
      const description = 'Test description';
      const processingJob = new ProcessingJob('job-id', id) as ProcessingJob;
      const presignedUrl = 'https://example.com/video.mp4';

      const processingJobJson = {
        id: 'job-id',
        videoId: id,
        requestedAt: mockDate,
        statusHistory: [],
        notifications: [],
        startedAt: undefined,
        finishedAt: undefined,
        errorMessage: undefined,
        currentStatus: undefined,
      };

      jest.spyOn(processingJob, 'toJSON').mockReturnValue(processingJobJson);

      const video = new Video(
        id,
        userId,
        name,
        originalKey,
        resultKey,
        description,
        mockDate,
        processingJob,
        presignedUrl,
      );

      const json = video.toJSON();

      expect(json).toEqual({
        id,
        userId,
        name,
        originalKey,
        description,
        createdAt: mockDate,
        processingJob: processingJobJson,
        resultKey,
        presignedUrl,
      });
    });

    it('should return null for processingJob when it is undefined', () => {
      const video = new Video(
        'video-id',
        'user-id',
        'Video Name',
        'original/key.mp4',
        'frames/result.zip',
      );

      const json = video.toJSON();

      expect(json.processingJob).toBeUndefined();
    });
  });
});
