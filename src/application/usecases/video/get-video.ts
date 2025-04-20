import { IStorageService } from '@/application/ports/storage';
import { Video } from '@/domain/entities/video';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  videoId: string;
};

type Output = Video;

export class GetVideo {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const { videoId } = input;
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    if (video.resultKey) {
      const presignedUrl = await this.storageService.getUploadPresignedUrl({
        fileKey: video.resultKey,
        contentType: 'video/mp4',
        expiresIn: 3600,
      });
      video.setPresignedUrl(presignedUrl);
    }
    return video;
  }
}
