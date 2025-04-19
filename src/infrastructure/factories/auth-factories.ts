import { Authenticate } from "@/application/usecases/auth/authenticate";
import { AuthenticateController } from "../controllers/auth/authenticate-controller";
import { makeUserRepository } from "./user-controller-factory";
import { makeJwtTokenService } from "./token-service-factory";
import { AuthMiddleware } from "../middlewares/auth-middleware";

export const makeAuthenticateUseCase = () => {
  return new Authenticate(makeUserRepository(), makeJwtTokenService());
};

export const makeAuthenticateController = () => {
  return new AuthenticateController(makeAuthenticateUseCase());
};

export const makeAuthMiddleware = () => {
  return new AuthMiddleware(makeJwtTokenService());
};
