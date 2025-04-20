import { IStorageService } from '@/application/ports/storage';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  videoId: string;
};

type Output = {
  downloadUrl: string;
};

export class GetZipVideo {
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
    const presignedUrl = await this.storageService.getDownloadPresignedUrl({
      fileKey: video.resultKey,
      expiresIn: 3600,
    });

    return {
      downloadUrl: presignedUrl,
    };
  }
}
