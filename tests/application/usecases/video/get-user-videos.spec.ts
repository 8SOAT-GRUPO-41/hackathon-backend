import { GetUserVideos } from '@/application/usecases/video/get-user-videos';
import { Video } from '@/domain/entities/video';
import { IVideoRepository } from '@/domain/repository/video-repository';

describe('GetUserVideos UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let videoRepository: jest.Mocked<IVideoRepository>;
  let getUserVideos: GetUserVideos;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    videoRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };

    getUserVideos = new GetUserVideos(videoRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return videos for a user', async () => {
    // Arrange
    const userId = 'user-123';
    const mockVideos = [
      new Video(
        'video-1',
        userId,
        'Test Video 1',
        'raw/video-1.mp4',
        'frames/video-1.zip',
        'Test Description 1',
        mockDate,
      ),
      new Video(
        'video-2',
        userId,
        'Test Video 2',
        'raw/video-2.mp4',
        'frames/video-2.zip',
        'Test Description 2',
        mockDate,
      ),
    ];

    videoRepository.findByUserId.mockResolvedValue(mockVideos);

    // Act
    const result = await getUserVideos.execute({ userId });

    // Assert
    expect(videoRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockVideos);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('video-1');
    expect(result[1].id).toBe('video-2');
  });

  it('should return empty array when user has no videos', async () => {
    // Arrange
    const userId = 'user-without-videos';
    videoRepository.findByUserId.mockResolvedValue([]);

    // Act
    const result = await getUserVideos.execute({ userId });

    // Assert
    expect(videoRepository.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should throw error if repository fails', async () => {
    // Arrange
    const userId = 'user-123';
    const mockError = new Error('Database error');
    videoRepository.findByUserId.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getUserVideos.execute({ userId })).rejects.toThrow(mockError);
    expect(videoRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
