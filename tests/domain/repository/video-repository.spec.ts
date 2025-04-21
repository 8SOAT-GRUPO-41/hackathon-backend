import { Video } from '@/domain/entities/video';
import { IVideoRepository } from '@/domain/repository/video-repository';

class MockVideoRepository implements IVideoRepository {
  private videos: Video[] = [];

  async findById(id: string): Promise<Video | null> {
    const video = this.videos.find((v) => v.id === id);
    return video || null;
  }

  async findByUserId(userId: string): Promise<Video[]> {
    return this.videos.filter((v) => v.userId === userId);
  }

  async save(video: Video): Promise<void> {
    const index = this.videos.findIndex((v) => v.id === video.id);
    if (index >= 0) {
      this.videos[index] = video;
    } else {
      this.videos.push(video);
    }
  }
}

describe('VideoRepository Interface', () => {
  let repository: IVideoRepository;
  let video: Video;
  const userId = 'user-id-123';

  beforeEach(() => {
    repository = new MockVideoRepository();
    video = new Video(
      'video-id-123',
      userId,
      'Test Video',
      'original/key.mp4',
      'frames/result.zip',
      'Test description',
      new Date(),
    );
  });

  describe('findById', () => {
    it('should return the video when found by id', async () => {
      await repository.save(video);

      const result = await repository.findById(video.id);

      expect(result).toBe(video);
    });

    it('should return null when video is not found by id', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return all videos for a user', async () => {
      const video1 = new Video(
        'video-id-1',
        userId,
        'Video 1',
        'original/key1.mp4',
        'frames/result1.zip',
      );

      const video2 = new Video(
        'video-id-2',
        userId,
        'Video 2',
        'original/key2.mp4',
        'frames/result2.zip',
      );

      await repository.save(video1);
      await repository.save(video2);

      const videos = await repository.findByUserId(userId);

      expect(videos).toHaveLength(2);
      expect(videos).toContain(video1);
      expect(videos).toContain(video2);
    });

    it('should return an empty array when no videos are found for the user', async () => {
      const videos = await repository.findByUserId('non-existent-user-id');

      expect(videos).toHaveLength(0);
    });
  });

  describe('save', () => {
    it('should add a new video when it does not exist', async () => {
      await repository.save(video);

      const savedVideo = await repository.findById(video.id);

      expect(savedVideo).toBe(video);
    });

    it('should update an existing video', async () => {
      await repository.save(video);

      const updatedVideo = new Video(
        video.id,
        userId,
        'Updated Video Name',
        video.originalKey,
        video.resultKey,
        'Updated description',
        video.createdAt,
      );

      await repository.save(updatedVideo);

      const result = await repository.findById(video.id);

      expect(result).toBe(updatedVideo);
      expect(result?.name).toBe('Updated Video Name');
      expect(result?.description).toBe('Updated description');
    });
  });
});
