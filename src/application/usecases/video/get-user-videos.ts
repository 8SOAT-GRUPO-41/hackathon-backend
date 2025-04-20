import { Video } from '@/domain/entities/video';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  userId: string;
};

type Output = Video[];

export class GetUserVideos {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(input: Input): Promise<Output> {
    const { userId } = input;
    const videos = await this.videoRepository.findByUserId(userId);
    return videos;
  }
}
