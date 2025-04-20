import { Controller } from '../controllers/interfaces';
import { CreateVideoController } from '../controllers/videos/create-video-controller';
import { makeCreateVideoUseCase } from './usecase/create-video-factory';

export const makeCreateVideoController = (): Controller => {
  return new CreateVideoController(makeCreateVideoUseCase());
};
