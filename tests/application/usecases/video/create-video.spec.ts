import { IStorageService } from '@/application/ports/storage';
import { CreateVideo } from '@/application/usecases/video/create-video';
import { Video } from '@/domain/entities/video';
import { IVideoRepository } from '@/domain/repository/video-repository';

jest.mock('@/domain/entities/video');

describe('CreateVideo UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let videoRepository: jest.Mocked<IVideoRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let createVideo: CreateVideo;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    videoRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };

    storageService = {
      getUploadPresignedUrl: jest.fn(),
      getDownloadPresignedUrl: jest.fn(),
    };

    createVideo = new CreateVideo(videoRepository, storageService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a video and return upload URL', async () => {
    // Arrange
    const input = {
      userId: 'user-123',
      name: 'Test Video',
      description: 'Test Description',
    };

    const mockVideo = new Video(
      'video-123',
      input.userId,
      input.name,
      'raw/video-123.mp4',
      'frames/video-123.zip',
      input.description,
      mockDate,
    );

    const mockUploadUrl = 'https://storage.example.com/upload-url';

    (Video.create as jest.Mock).mockReturnValue(mockVideo);
    videoRepository.save.mockResolvedValue(undefined);
    storageService.getUploadPresignedUrl.mockResolvedValue(mockUploadUrl);

    // Act
    const result = await createVideo.execute(input);

    // Assert
    expect(Video.create).toHaveBeenCalledWith(input.userId, input.name, input.description);
    expect(videoRepository.save).toHaveBeenCalledWith(mockVideo);
    expect(storageService.getUploadPresignedUrl).toHaveBeenCalledWith({
      fileKey: mockVideo.originalKey,
      contentType: 'video/mp4',
      expiresIn: 3600,
    });
    expect(result).toEqual({
      video: mockVideo,
      uploadUrl: mockUploadUrl,
    });
  });

  it('should create a video without description', async () => {
    // Arrange
    const input = {
      userId: 'user-123',
      name: 'Test Video',
    };

    const mockVideo = new Video(
      'video-123',
      input.userId,
      input.name,
      'raw/video-123.mp4',
      'frames/video-123.zip',
      undefined,
      mockDate,
    );

    const mockUploadUrl = 'https://storage.example.com/upload-url';

    (Video.create as jest.Mock).mockReturnValue(mockVideo);
    videoRepository.save.mockResolvedValue(undefined);
    storageService.getUploadPresignedUrl.mockResolvedValue(mockUploadUrl);

    // Act
    const result = await createVideo.execute(input);

    // Assert
    expect(Video.create).toHaveBeenCalledWith(input.userId, input.name, undefined);
    expect(videoRepository.save).toHaveBeenCalledWith(mockVideo);
    expect(storageService.getUploadPresignedUrl).toHaveBeenCalledWith({
      fileKey: mockVideo.originalKey,
      contentType: 'video/mp4',
      expiresIn: 3600,
    });
    expect(result).toEqual({
      video: mockVideo,
      uploadUrl: mockUploadUrl,
    });
  });

  it('should throw error if video repository save fails', async () => {
    // Arrange
    const input = {
      userId: 'user-123',
      name: 'Test Video',
    };

    const mockVideo = new Video(
      'video-123',
      input.userId,
      input.name,
      'raw/video-123.mp4',
      'frames/video-123.zip',
      undefined,
      mockDate,
    );

    const mockError = new Error('Failed to save video');

    (Video.create as jest.Mock).mockReturnValue(mockVideo);
    videoRepository.save.mockRejectedValue(mockError);

    // Act & Assert
    await expect(createVideo.execute(input)).rejects.toThrow(mockError);
    expect(storageService.getUploadPresignedUrl).not.toHaveBeenCalled();
  });

  it('should throw error if getting upload URL fails', async () => {
    // Arrange
    const input = {
      userId: 'user-123',
      name: 'Test Video',
    };

    const mockVideo = new Video(
      'video-123',
      input.userId,
      input.name,
      'raw/video-123.mp4',
      'frames/video-123.zip',
      undefined,
      mockDate,
    );

    const mockError = new Error('Failed to get upload URL');

    (Video.create as jest.Mock).mockReturnValue(mockVideo);
    videoRepository.save.mockResolvedValue(undefined);
    storageService.getUploadPresignedUrl.mockRejectedValue(mockError);

    // Act & Assert
    await expect(createVideo.execute(input)).rejects.toThrow(mockError);
  });
});
