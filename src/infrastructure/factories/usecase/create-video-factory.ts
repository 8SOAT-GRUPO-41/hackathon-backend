import { CreateVideo } from '@/application/usecases/video/create-video';
import { makeVideoRepository } from '../repository/video-repository-factory';
import { makeS3Gateway } from '../s3-gateway-factory';

export const makeCreateVideoUseCase = () => {
  return new CreateVideo(makeVideoRepository(), makeS3Gateway());
};
