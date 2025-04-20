import { Authenticate } from '@/application/usecases/auth/authenticate';
import { RefreshToken } from '@/application/usecases/auth/refresh-token';
import { AuthenticateController } from '../controllers/auth/authenticate-controller';
import { RefreshTokenController } from '../controllers/auth/refresh-token-controller';
import { makeUserRepository } from './user-controller-factory';
import { makeJwtTokenService } from './token-service-factory';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { SignUp } from '@/application/usecases/auth/sign-up';
import { SignUpController } from '../controllers/auth/sign-up-controller';

export const makeAuthenticateUseCase = () => {
  return new Authenticate(makeUserRepository(), makeJwtTokenService());
};

export const makeAuthenticateController = () => {
  return new AuthenticateController(makeAuthenticateUseCase());
};

export const makeRefreshTokenUseCase = () => {
  return new RefreshToken(makeJwtTokenService());
};

export const makeRefreshTokenController = () => {
  return new RefreshTokenController(makeRefreshTokenUseCase());
};

export const makeAuthMiddleware = () => {
  return new AuthMiddleware(makeJwtTokenService());
};

export const makeSignUpUseCase = () => {
  return new SignUp(makeUserRepository());
};

export const makeSignUpController = () => {
  return new SignUpController(makeSignUpUseCase());
};
