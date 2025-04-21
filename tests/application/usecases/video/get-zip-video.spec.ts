import { IStorageService } from '@/application/ports/storage';
import { GetZipVideo } from '@/application/usecases/video/get-zip-video';
import { Video } from '@/domain/entities/video';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

describe('GetZipVideo UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let videoRepository: jest.Mocked<IVideoRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let getZipVideo: GetZipVideo;

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

    getZipVideo = new GetZipVideo(videoRepository, storageService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a download URL when video is found', async () => {
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

    const mockPresignedUrl = 'https://storage.example.com/download-url';

    videoRepository.findById.mockResolvedValue(mockVideo);
    storageService.getDownloadPresignedUrl.mockResolvedValue(mockPresignedUrl);

    // Act
    const result = await getZipVideo.execute({ videoId });

    // Assert
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getDownloadPresignedUrl).toHaveBeenCalledWith({
      fileKey: mockVideo.resultKey,
      expiresIn: 3600,
    });
    expect(result).toEqual({ downloadUrl: mockPresignedUrl });
  });

  it('should throw NotFoundError when video is not found', async () => {
    // Arrange
    const videoId = 'non-existent-video';
    videoRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(getZipVideo.execute({ videoId })).rejects.toThrow(NotFoundError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getDownloadPresignedUrl).not.toHaveBeenCalled();
  });

  it('should throw error if repository fails', async () => {
    // Arrange
    const videoId = 'video-123';
    const mockError = new Error('Database error');
    videoRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getZipVideo.execute({ videoId })).rejects.toThrow(mockError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getDownloadPresignedUrl).not.toHaveBeenCalled();
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
    storageService.getDownloadPresignedUrl.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getZipVideo.execute({ videoId })).rejects.toThrow(mockError);
    expect(videoRepository.findById).toHaveBeenCalledWith(videoId);
    expect(storageService.getDownloadPresignedUrl).toHaveBeenCalled();
  });
});
