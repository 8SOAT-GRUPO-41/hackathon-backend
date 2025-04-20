import { SignIn } from '@/application/usecases/auth/sign-in';
import { CreateUser } from '@/application/usecases/user/create-user';
import { DeleteUser } from '@/application/usecases/user/delete-user';
import { SignInController } from '../controllers/auth/sign-in-controller';
import { CreateUserController } from '../controllers/user/create-user-controller';
import { DeleteUserController } from '../controllers/user/delete-user-controller';
import { UserRepository } from '../repository/user-repository';
import { GetUserVideos } from '@/application/usecases/video/get-user-videos';
import { makeVideoRepository } from './repository/video-repository-factory';
import { GetUserVideosController } from '../controllers/videos/get-user-videos-controller';
import { GetZipVideoDownloadUrlController } from '../controllers/videos/get-zip-video-controller';
import { GetZipVideo } from '@/application/usecases/video/get-zip-video';
import { makeS3Gateway } from './s3-gateway-factory';
export const makeUserRepository = () => {
  return new UserRepository();
};

export const makeCreateUserUseCase = () => {
  return new CreateUser(makeUserRepository());
};

export const makeDeleteUserUseCase = () => {
  return new DeleteUser(makeUserRepository());
};

export const makeCreateUserController = () => {
  return new CreateUserController(makeCreateUserUseCase());
};

export const makeDeleteUserController = () => {
  return new DeleteUserController(makeDeleteUserUseCase());
};

export const makeSignIn = () => {
  return new SignIn(makeUserRepository());
};

export const makeSignInController = () => {
  return new SignInController(makeSignIn());
};

export const makeGetUserVideosUseCase = () => {
  return new GetUserVideos(makeVideoRepository());
};

export const makeGetUserVideosController = () => {
  return new GetUserVideosController(makeGetUserVideosUseCase());
};

export const makeGetZipVideoDownloadUrlUseCase = () => {
  return new GetZipVideo(makeVideoRepository(), makeS3Gateway());
};

export const makeGetZipVideoDownloadUrlController = () => {
  return new GetZipVideoDownloadUrlController(makeGetZipVideoDownloadUrlUseCase());
};
