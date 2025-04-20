import { Video } from '@/domain/entities/video';
import { Video as VideoPrisma } from '@prisma/client';
import { IVideoRepository } from '@/domain/repository/video-repository';
import prisma from '../prisma';

export class VideoRepository implements IVideoRepository {
  async findById(id: string): Promise<Video | null> {
    const video = await prisma.video.findUnique({
      where: {
        id,
      },
    });
    if (!video) {
      return null;
    }
    return this.mapToDomain(video);
  }
  async findByUserId(userId: string): Promise<Video[]> {
    const videos = await prisma.video.findMany({
      where: {
        userId,
      },
    });
    return videos.map((video) => this.mapToDomain(video));
  }
  async save(video: Video): Promise<void> {
    await prisma.video.create({
      data: {
        id: video.id,
        userId: video.userId,
        originalKey: video.originalKey,
        name: video.name,
        description: video.description,
      },
    });
  }

  private mapToDomain(video: VideoPrisma): Video {
    return new Video(
      video.id,
      video.userId,
      video.name,
      video.originalKey,
      video.description ?? undefined,
    );
  }
}
