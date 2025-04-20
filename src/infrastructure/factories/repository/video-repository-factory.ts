import { VideoRepository } from '@/infrastructure/repository/video-repository';

export const makeVideoRepository = () => {
  return new VideoRepository();
};
