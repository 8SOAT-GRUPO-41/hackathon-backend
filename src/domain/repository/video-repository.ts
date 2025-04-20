import { Video } from '@/domain/entities/video';
import { ProcessingJob } from '../entities/processing-job';

export interface IVideoRepository {
  findById(id: string): Promise<Video | null>;
  findByUserId(userId: string): Promise<Video[]>;
  save(video: Video): Promise<void>;
  saveProcessingJob(processingJob: ProcessingJob): Promise<void>;
}
