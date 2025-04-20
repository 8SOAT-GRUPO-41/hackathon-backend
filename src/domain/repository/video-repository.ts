import { Video } from '@/domain/entities/video';

export interface IVideoRepository {
  findById(id: string): Promise<Video | null>;
  findByUserId(userId: string): Promise<Video[]>;
  save(video: Video): Promise<void>;
  delete(video: Video): Promise<void>;
}
