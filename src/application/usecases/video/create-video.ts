import { IStorageService } from '@/application/ports/storage';
import { Video } from '@/domain/entities/video';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  userId: string;
  name: string;
  description?: string;
};

type Output = {
  video: Video;
  uploadUrl: string;
};

export class CreateVideo {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const { userId, name, description } = input;
    const video = Video.create(userId, name, description);
    await this.videoRepository.save(video);
    const uploadUrl = await this.storageService.getUploadPresignedUrl({
      fileKey: video.originalKey,
      contentType: 'video/mp4',
      expiresIn: 3600,
    });
    return {
      video,
      uploadUrl,
    };
  }
}
