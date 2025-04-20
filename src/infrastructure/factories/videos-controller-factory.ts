import { CreateVideo } from '@/application/usecases/video/create-video';
import { Controller } from '../controllers/interfaces';
import { CreateVideoController } from '../controllers/videos/create-video-controller';
import { makeS3Gateway } from './s3-gateway-factory';
import { VideoRepository } from '../repository/video-repository';

export const makeVideoRepository = () => {
  return new VideoRepository();
};

export const makeCreateVideoUseCase = () => {
  return new CreateVideo(makeVideoRepository(), makeS3Gateway());
};

export const makeCreateVideoController = (): Controller => {
  return new CreateVideoController(makeCreateVideoUseCase());
};
