import { IStorageService } from '@/application/ports/storage';
import { GetVideo } from '@/application/usecases/video/get-video';
import { Video } from '@/domain/entities/video';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

describe('GetVideo UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let videoRepository: jest.Mocked<IVideoRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let getVideo: GetVideo;

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

    getVideo = new GetVideo(videoRepository, storageService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a video with presigned URL when found', async () => {
    // Arrange
    const videoId = 'video-123';
    const userId = 'user-123';
    const mockVideo = new Video(
      videoId,
      userId,
      'Test Video',
      'raw/video-123.mp4',
      'frames/video-123.zip',
      'Test Description',
      mockDate,
    );

    const mockSetPresignedUrl = jest.spyOn(mockVideo, 'setPresignedUrl');
    const mockPresignedUrl = 'https://storage.example.com/download-url';

    videoRepository.findById.mockResolvedValue(mockVideo);
    storageService.getUploadPresignedUrl.mockResolvedValue(mockPresignedUrl);

    // Act
    const result = await getVideo.execute({ videoId });

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getUploadPresignedUrl).toHaveBeenCalledWith({
      fileKey: mockVideo.resultKey,
      contentType: 'video/mp4',
      expiresIn: 3600,
    });
    expect(mockSetPresignedUrl).toHaveBeenCalledWith(mockPresignedUrl);
    expect(result).toBe(mockVideo);
  });

  it('should throw NotFoundError when video is not found', async () => {
    // Arrange
    const videoId = 'non-existent-video';
    videoRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(getVideo.execute({ videoId })).rejects.toThrow(NotFoundError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getUploadPresignedUrl).not.toHaveBeenCalled();
  });

  it('should not set presigned URL if resultKey is falsy', async () => {
    // Arrange
    const videoId = 'video-123';
    const userId = 'user-123';
    // Creating video with undefined resultKey
    const mockVideo = new Video(
      videoId,
      userId,
      'Test Video',
      'raw/video-123.mp4',
      '', // Empty resultKey
      'Test Description',
      mockDate,
    );

    const mockSetPresignedUrl = jest.spyOn(mockVideo, 'setPresignedUrl');

    videoRepository.findById.mockResolvedValue(mockVideo);

    // Act
    const result = await getVideo.execute({ videoId });

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getUploadPresignedUrl).not.toHaveBeenCalled();
    expect(mockSetPresignedUrl).not.toHaveBeenCalled();
    expect(result).toBe(mockVideo);
  });

  it('should throw error if repository fails', async () => {
    // Arrange
    const videoId = 'video-123';
    const mockError = new Error('Database error');
    videoRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getVideo.execute({ videoId })).rejects.toThrow(mockError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getUploadPresignedUrl).not.toHaveBeenCalled();
  });

  it('should throw error if storage service fails', async () => {
    // Arrange
    const videoId = 'video-123';
    const userId = 'user-123';
    const mockVideo = new Video(
      videoId,
      userId,
      'Test Video',
      'raw/video-123.mp4',
      'frames/video-123.zip',
      'Test Description',
      mockDate,
    );

    const mockError = new Error('Storage service error');

    videoRepository.findById.mockResolvedValue(mockVideo);
    storageService.getUploadPresignedUrl.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getVideo.execute({ videoId })).rejects.toThrow(mockError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getUploadPresignedUrl).toHaveBeenCalled();
  });
});
